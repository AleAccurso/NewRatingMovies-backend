import { RequestHandler } from 'express';
import { User } from "../models/userModel";
import { Types } from 'mongoose';

import path from 'path';
import { Storage } from "@google-cloud/storage";

const gc = new Storage({
    keyFilename: path.join(__dirname, '../google-credentials.json'),
    projectId: 'my-project-1623954720104',
});

const bucketName = 'new_rating_movies_profile_pics';
const gcsBucket = gc.bucket('new_rating_movies_profile_pics');

export const removeOldPic = async (id: Types.ObjectId) => {
    // Remove current profilePic from Google Cloud if not the default profile picture
    let user = await User.findById(id).exec();
    if (user) {
        try {
            if (user.profilePic != 'defaultPortrait.png') {
                //Retrieve file from bucket and delete it if exists
                let oldProfilePic = gcsBucket.file(user.profilePic);

                oldProfilePic.exists(function (err: Error, exists) {
                    if (exists) {
                        oldProfilePic.delete();
                    }
                    if (err) {
                        return 'Error: ' + err;
                    }
                });
            }
        } catch (error) {
            return 'Error: ' + error;
        }
    }
};

export const uploadPic: RequestHandler = async (req, res) => {
    //Upload the new profilePic
    try {
        //Send to Google Cloud
        const blob = gcsBucket.file(req.file.originalname);

        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream
            .on('finish', async () => {
                req.file.cloudStorageObject = req.file.originalname;
            })
            .on('error', (err: Error) => {
                req.file.cloudStorageError = err;
            })
            .end(req.file.buffer);
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
};

export default { removeOldPic, uploadPic };
