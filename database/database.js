const mongoose = require("mongoose");
const { wakeDyno, wakeDynos } = require("heroku-keep-awake");

exports.Initialise = async (app) => {
  mongoose
    .connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((result) => {
      app.listen(process.env.PORT, () => {
        console.log("Server started.");

        const opts = {
          interval: 29,
          logging: false,
          stopTimes: { start: "00:00", end: "06:00" },
        };

        wakeDyno(process.env.FRONT_URL, opts);
      });
    })
    .catch((err) => console.log(err));
};
