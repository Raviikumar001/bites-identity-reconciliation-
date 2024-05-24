import express from "express";
import identify from "../controller/contact-controller";
let Router = express.Router();

Router.post("/identify", identify);

export default Router;
