const userModel = require("../models/userModel");

const path = require("path");
const { Storage } = require("@google-cloud/storage");

const gc = new Storage({
  keyFilename: path.join(__dirname, "../google-credentials.json"),
  projectId: "my-project-1623954720104",
});

const bucketName = "new_rating_movies_profile_pics";
const gcsBucket = gc.bucket("new_rating_movies_profile_pics");

exports.removeOldPic = async (id) => {
  // Remove current profilePic from Google Cloud if not the default profile picture
  let user = await userModel.findById(id).exec();
  if (user) {
    try {
      if (user.profilePic != "defaultPortrait.png") {
        //Retrieve file from bucket and delete it if exists
        let oldProfilePic = gcsBucket.file(user.profilePic);

        oldProfilePic.exists(function (err, exists) {
          if (exists) {
            oldProfilePic.delete();
          }
          if (err) {
            return "Error: " + error;
          }
        });
      }
    } catch (error) {
      return "Error: " + error;
    }
  }
};

exports.uploadPic = async (req, res) => {
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
      .on("finish", async () => {
        req.file.cloudStorageObject = req.file.originalname;
      })
      .on("error", () => {
        req.file.cloudStorageError = err;
      })
      .end(req.file.buffer);
  } catch (err) {
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};
