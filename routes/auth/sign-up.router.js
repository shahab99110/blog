const express = require("express");
const { httpGetSignUp, httpPostSignUp} = require("./sign-up.controller");

const authRouter = express.Router();

authRouter.get("/auth/form/sign-up", httpGetSignUp);
authRouter.post("/auth/form/signup", httpPostSignUp);

module.exports = authRouter;
