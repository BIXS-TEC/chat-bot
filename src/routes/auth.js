import express from "express";

const auth = express.Router();

auth.get("/auth", (req, res) => {
    res.status(200).json({ token: '1234567890'});
});

export default auth;
