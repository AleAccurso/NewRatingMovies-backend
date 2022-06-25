import { RequestHandler } from "express"; 
import jwt from "jsonwebtoken";
import { authMsg } from "../contants/responseMessages";
import userModel from "../models/userModel";

export const isAdmin: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await userModel.findOne({ email: decoded.email });
    if (!user.isAdmin) {
      throw new Error();
    }
    next();
  } catch (error) {
    return res.status(403).json({
      message: authMsg.UNAUTHORIZED,
    });
  }
};
