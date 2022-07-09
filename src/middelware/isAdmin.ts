import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { authMsg, msg } from '../contants/responseMessages';
import { User } from '../schema/user';

export const isAdmin: RequestHandler = async (req, res, next) => {
    let decoded: string | jwt.JwtPayload;

    try {
        const authHeader = req.get('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                message: authMsg.NOT_AUTHENTICATED,
            });
        }

        const token = authHeader.split(' ')[1];

        decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (typeof decoded != 'string') {
            let user = await User.findOne({ email: decoded.email as string });

            if (!user) {
                return res.status(401).json({
                    message: msg.RESOURCE_NOT_FOUND + 'user',
                });
            }

            if (!user.isAdmin) {
                throw new Error();
            }
        }
        next();
    } catch (err) {
        return res.status(403).json({
            message: authMsg.UNAUTHORIZED,
        });
    }
};
