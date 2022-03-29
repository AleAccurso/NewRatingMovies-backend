const mongoose = require("mongoose");

exports.Initialise = async (app) => {
  mongoose
    .connect(process.env.MONGOOSE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((result) => {
      app.listen(process.env.PORT, () => console.log("Server started."));
    })
    .catch((err) => console.log(err));
};
