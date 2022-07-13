import { RequestHandler } from "express"; 
import jwt from "jsonwebtoken";
import { authMsg } from "../contants/responseMessages";
import { User } from "../schema/user";

export const isAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      message: authMsg.NOT_AUTHENTICATED,
    });
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: string | jwt.JwtPayload;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(500).json({
      message: `${err}`,
    });
  }

  if (!decodedToken) {
    return res.status(401).json({
      message: authMsg.NOT_AUTHENTICATED,
    });
  }

  if (typeof decodedToken != "string"){
    console.log("🚀 ~ constisAuth:RequestHandler= ~ decodedToken", decodedToken);
    let user = await User.findOne({ email: decodedToken.email as string});
    
    if (user) {
      req._userId = user._id;
      req._userAdmin = user.isAdmin;
    }
  }
  
  next();
};
