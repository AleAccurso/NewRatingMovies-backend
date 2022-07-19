"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPic = exports.removeOldPic = void 0;
const path_1 = __importDefault(require("path"));
const storage_1 = require("@google-cloud/storage");
const user_1 = require("@schema/user");
const parseToMongoId_1 = require("@utils/parseToMongoId");
const gc = new storage_1.Storage({
    keyFilename: path_1.default.join(__dirname, '@google-credentials.json'),
    projectId: 'my-project-1623954720104',
});
const bucketName = 'new_rating_movies_profile_pics';
const gcsBucket = gc.bucket('new_rating_movies_profile_pics');
const removeOldPic = async (req, res, next) => {
    let userId = {};
    if (req && req.query && req.query.id) {
        const parseResult = (0, parseToMongoId_1.parseToMongoId)(req.query.id);
        if (parseResult.error || typeof parseResult.parsedId == 'undefined') {
            res.status(400).json({ message: parseResult.error });
        }
        else {
            userId = parseResult.parsedId;
        }
    }
    // Remove current profilePic from Google Cloud if not the default profile picture
    let user = await user_1.User.findById(userId).exec();
    if (user) {
        try {
            if (user.profilePic != 'defaultPortrait.png') {
                //Retrieve file from bucket and delete it if exists
                let oldProfilePic = gcsBucket.file(user.profilePic);
                oldProfilePic.exists(function (err, exists) {
                    if (exists) {
                        oldProfilePic.delete();
                    }
                    if (err) {
                        return 'Error: ' + err;
                    }
                });
            }
        }
        catch (error) {
            return 'Error: ' + error;
        }
    }
};
exports.removeOldPic = removeOldPic;
const uploadPic = async (req, res) => {
    //Upload the new profilePic
    try {
        // Get file from request
        let file = req._file;
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
    }
    catch (err) {
        res.status(500).send({
            message: `Could not upload the file. ${err}`,
        });
    }
};
exports.uploadPic = uploadPic;
exports.default = { removeOldPic: exports.removeOldPic, uploadPic: exports.uploadPic };
