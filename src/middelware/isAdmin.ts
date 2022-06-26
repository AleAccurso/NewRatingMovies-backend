import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { authMsg } from '../contants/responseMessages';
import { User } from '../models/userModel';

export const isAdmin: RequestHandler = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                message: authMsg.NOT_AUTHENTICATED,
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = await User.findOne({ email: decoded.email });

        if (!user.isAdmin) {
            throw new Error();
        }
        next();
    } catch (err) {
        return res.status(403).json({
            message: authMsg.UNAUTHORIZED,
        });
    }
};
