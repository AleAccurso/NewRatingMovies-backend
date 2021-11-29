const express = require("express");
const userModel = require("../models/userModel");
const router = express.Router();

router.route("/users").get((req, res) => {
  userModel.find({}, (err, users) => {
    if (err) {
      console.log("RETRIEVE error: " + err);
      res.status(500).send("Error");
    } else if (users) {
      res.status(200).json(users);
    }
  });

  router.get("/user/:userId", (req, res) => {
    const user = userModel.findOne({ _id: req.params.userId }, (err, user) => {
      if (err) {
        console.log("RETRIEVE error: " + err);
        res.status(500).send("Error");
      } else if (user) {
        res.status(200).json(user);
      }
    });
  });

  router.route("/user/update/:userId").patch((req, res) => {
    // let id = req.params.id;
    userModel.findOneAndUpdate(
      { _id: req.params.userId },
      {
        ...req.body,
      },
      (err) => {
        if (err) {
          res.status(500).send("Error");
        } else {
          res.status(200).json("User Sucessfully updated");
        }
      }
    );
  });

  router.route("/user/delete/:userId").delete((req, res) => {
    userModel.deleteOne({ _id: req.params.userId }, (err) => {
      if (err) {
        res.status(500).send("Error");
      } else {
        res.status(200).json("User deleted");
      }
    });
  });
});

module.exports = router;
