const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();

const util = require("util");
const { removeOldPic, uploadFile } = require("../helpers/upload")

//Update user - To manage formData
const Multer  = require('multer')
const upload = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum file size is 5MB
  },
}).single("avatar")

// let processFileMiddleware = util.promisify(upload);

//Routes
router.get("/", (req, res) => {
  const user = userModel.find({}, (err, users) => {
    if (err) {
      console.log("RETRIEVE error: " + err);
      res.status(500).send("Error");
    } else if (users) {
      res.status(200).json(users);
    }
  });
});

//Get a user
router.get("/:id", (req, res) => {
  const user = userModel.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      console.log("RETRIEVE error: " + err);
      res.status(500).send("Error");
    } else if (user) {
      res.status(200).json(user);
    }
  });
});

//update a user
router.post("/:id", upload, async (req, res) => {
  let fileToUpload = req.file
  let body = req.body

  // Manage File in the update request
  if (fileToUpload) {
    // Remove old file
    const remove = await removeOldPic(req.params.id);

    // Get a new filename for the file
    let newfilename = Math.round((new Date()).getTime());
    let ext = req.file.mimetype.split('/')[1];
    req.file.originalname = newfilename + "." + ext;
    body.profilePic = newfilename + "." + ext;
    
    // Send file to Google Cloud Storage
    try{
      await util.promisify(upload);
      const uploaded = await uploadFile(req, res)
    } catch (error) {
      res.status(500).send({ message: err.message });
    }
  }
    
  // Manage text field of the update request
  userModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      ...body,
    },
    (err) => {
      if (err) {
        res.status(500).send("Error");
      } else {
        res.status(200).json(req.body);
      }
    }
  );
});

//Delete a user
router.delete("/:id", (req, res) => {
  userModel.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send("Error");
    } else {
      res.status(200).json("User deleted");
    }
  });
});

// Add, modify & remove a rate
router.patch("/:id/:movieDbId/:rate", (req, res) => {
  const user = userModel.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      console.log("RETRIEVE error: " + err);
      res.status(500).send("Error");
    } else if (user) {
      let userChanged = false;
      let index = user.myRates.findIndex(
        (rate) => rate.movieDbId === req.params.movieDbId
      );

      if (index > -1) {
        if (req.params.rate == 0) {
          user.myRates.splice(index, 1);
          userChanged = true;
        } else {
          user.myRates[index] = {
            movieDbId: req.params.movieDbId,
            rate: req.params.rate * 2,
          };
          userChanged = true;
        }
      } else if (req.params.rate > 0) {
        user.myRates.push({
          movieDbId: req.params.movieDbId,
          rate: req.params.rate * 2,
        });
        userChanged = true;
      }

      if (userChanged) {
        user.save();
      }

      res.status(200).json({
        movieDbId: req.params.movieDbId,
        rate: req.params.rate * 2,
      });
    }
  });
});

//Add & remove a favorite
router.patch("/:id/:movieDbId", (req, res) => {
  const user = userModel.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      res.status(500).send("Error");
    } else if (user) {
      let index = user.myFavorites.indexOf(req.params.movieDbId);
      if (index >= 0) {
        user.myFavorites.splice(index, 1);
      } else {
        user.myFavorites.push(req.params.movieDbId);
      }

      user.save();
      res.status(200).json(req.params.movieDbId);
    }
  });
});

module.exports = router;
