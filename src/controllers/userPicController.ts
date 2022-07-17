import { RequestHandler } from 'express';
import { User } from "schema/user";

import path from 'path';
import { Storage } from "@google-cloud/storage";
import { FileRequest } from 'interfaces/file';

const gc = new Storage({
    keyFilename: path.join(__dirname, '@google-credentials.json'),
    projectId: 'my-project-1623954720104',
});

const bucketName = 'new_rating_movies_profile_pics';
const gcsBucket = gc.bucket('new_rating_movies_profile_pics');

export const removeOldPic: RequestHandler = async (req, res, next) => {
    // Remove current profilePic from Google Cloud if not the default profile picture
    let user = await User.findById(req._id).exec();
    if (user) {
        try {
            if (user.profilePic != 'defaultPortrait.png') {
                //Retrieve file from bucket and delete it if exists
                let oldProfilePic = gcsBucket.file(user.profilePic);

                oldProfilePic.exists(function (err: Error, exists: boolean) {
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
        // Get file from request
        let file = req.file as FileRequest

        //Send to Google Cloud
        const blob = gcsBucket.file(file.originalname);

        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream
            .on('finish', async () => {
                file.cloudStorageObject = file.originalname;
            })
            .on('error', (err) => {
                file.cloudStorageError = err;
            })
            .end(file.buffer);
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file. ${err}`,
        });
    }
};

export default { removeOldPic, uploadPic };
