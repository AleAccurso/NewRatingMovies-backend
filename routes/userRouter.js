const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();

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
router.patch("/:id", (req, res) => {
  userModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      ...req.body,
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

module.exports = router;
