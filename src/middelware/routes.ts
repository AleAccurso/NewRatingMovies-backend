import { RequestHandler } from 'express';
import { ObjectId } from 'mongodb';
import { msg } from '../contants/responseMessages';
import { language } from '../types/language';

export const routerParamConverter: RequestHandler = (req, res, next) => {
    console.log("in routerParamConverter")
    
    if (req.query && req.query.page && typeof req.query.page === 'string') {
        let page = Number(req.query.page);

        if (!isNaN(page)) {
            req._page = page;
        } else {
            return res.status(500).json({
                message: msg.BAD_PARAMS + 'page',
            });
        }
    }

    if (req.query && req.query.size && typeof req.query.size === 'string') {
        let size = Number(req.query.size);
        if (!isNaN(size)) {
            req._size = size;
        } else {
            return res.status(500).json({
                message: msg.BAD_PARAMS + 'size',
            });
        }
    }

    if (req.params && req.params.id && typeof req.params.id === 'string') {
        let id = new ObjectId(req.params.id);
        req._id = id;
    }

    if (
        req.params &&
        req.params.movieDbId &&
        typeof req.params.movieDbId === 'string'
    ) {
        let movieDbId = Number(req.params.movieDbId);
        if (!isNaN(movieDbId)) {
            req._movieDbId = movieDbId;
        } else {
            return res.status(500).json({
                message: msg.BAD_PARAMS + 'movieDbId',
            });
        }
    }

    if (
        req.params &&
        req.params.language &&
        typeof req.params.language === 'string'
    ) {
        let availableLanguages = process.env.LANGUAGES;
        if (availableLanguages.includes(req.params.language)) {
            req._language = req.params.language as language;
        } else {
            return res.status(500).json({
                message: msg.BAD_PARAMS + 'language',
            });
        }
    }

    if (req.params && req.params.rate && typeof req.params.rate === 'string') {
        let rate = Number(req.params.rate);
        if (!isNaN(rate)) {
            req._movieDbId = rate;
        } else {
            return res.status(500).json({
                message: msg.BAD_PARAMS + 'rate',
            });
        }
    }

    next();
};
