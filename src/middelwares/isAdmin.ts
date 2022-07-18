import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { authMsg, msg } from '@constants/constants';
import { User } from '@schema/user';

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
                req._userAdmin = false;
                return res.status(401).json({
                    message: msg.RESOURCE_NOT_FOUND + 'user',
                });
            }

            if (!user.isAdmin) {
                throw new Error();
            }
            req._userId = user._id
            req._userAdmin = true;
        } else {
            req._userAdmin = false;
        }
        next();
    } catch (err) {
        return res.status(403).json({
            message: authMsg.UNAUTHORIZED,
        });
    }
};
