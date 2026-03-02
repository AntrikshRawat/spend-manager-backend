const express = require("express");
const Router = express.Router();
const User = require("../Models/User");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const googleClientId = process.env.AUTH_CLIENT_ID;

const generateUniqueUsername = async (email) => {
	const emailPrefix = (email.split("@")[0] || "user").replace(/[^a-zA-Z0-9]/g, "");

	let candidate = `${emailPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
	let existingUser = await User.findOne({ userName: candidate });

	while (existingUser) {
		candidate = `${emailPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
		existingUser = await User.findOne({ userName: candidate });
	}

	return candidate;
};

Router.post("/", async (req, res) => {
	try {
		const token = req.body?.token || req.body?.credential || req.body?.idToken;

		if (!token) {
			return res.status(400).json({ message: "Google token is required" });
		}

		const { data } = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
			params: {
				id_token: token,
			},
		});

		if (!data?.email || data?.email_verified !== "true") {
			return res.status(401).json({ message: "Invalid Google token" });
		}

		if (googleClientId && data.aud !== googleClientId) {
			return res.status(401).json({ message: "Google token audience mismatch" });
		}

		let user = await User.findOne({ email: data.email });

		if (!user) {
			const randomPassword = crypto.randomBytes(32).toString("hex");
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(randomPassword, salt);

			const uniqueUserName = await generateUniqueUsername(data.email);
			const [firstName = "Google", ...lastNameParts] = (data.name || "Google User").split(" ");

			user = await User.create({
				firstName,
				lastName: lastNameParts.join(" "),
				userName: uniqueUserName,
				email: data.email,
				password: hashedPassword,
			});
		}

		const authToken = jwt.sign({ id: user._id }, secret);
		res.cookie("authToken", authToken, {
			httpOnly: true,
			sameSite: "none",
			secure: true,
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		return res.json({ message: "Google Authentication Successful", authToken });
	} catch (e) {
		return res.status(500).json({ message: "Internal Application Error" });
	}

});


module.exports = Router;