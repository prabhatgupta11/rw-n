const express = require("express");
const { UserModel } = require("../model/usermodel");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const userrouter = express.Router();

// Register the user
userrouter.post("/register", async (req, res) => {
    const { name, email, gender, password, city, age, is_married } = req.body;

    try {
        const user = await UserModel.findOne({ email: email });
        if (user) {
            return res.status(200).send({ msg: "User already exists, please login" });
        } else {
            const hashPassword = await bcrypt.hashSync(password, 6);
            const newUser = new UserModel({
                name,
                email,
                gender,
                password: hashPassword,
                city,
                age,
                is_married
            });
            await newUser.save();

            return res.json({ msg: "User registered", user: newUser });
        }
    } catch (err) {
        res.status(400).send({ msg: err.message });
    }
});

// Login the user
userrouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return res.status(400).send({ msg: "Please register first" });
        }

        const isPassCorrect = await bcrypt.compareSync(password, user.password);

        if (isPassCorrect) {
            const token = await jwt.sign({ email: user.email, userId: user._id }, 'masai');
            res.status(200).send({ msg: "Login success", token: token, newUser: user });
        } else {
            res.status(400).send({ msg: "Wrong password" });
        }
    } catch (err) {
        res.status(400).send({ msg: "Something went wrong in the login section", err });
    }
});

// Get all users
userrouter.get("/allusers", async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json({ msg: "Here are all the users", users });
    } catch (err) {
        console.log(err);
        res.status(400).json(err.message);
    }
});

module.exports = {
    userrouter
};
