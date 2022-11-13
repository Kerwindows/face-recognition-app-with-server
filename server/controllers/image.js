const Clarifai = require("clarifai");

const app = new Clarifai.App({
  apiKey: "82b1d3173bd34131ba5e6fc16a0b8604",
});
const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(400).json("Unable to work with API");
    });
};

const handleImage = (req, res, db) => {
  const { id } = req.body;

  db("users")
    .where("id", "=", id)
    .increment({
      entries: "1",
    })
    .returning("entries")
    .then((entries) => {
      console.log("entries[0]", entries[0]); //entries[0] returns and array
      res.json(entries[0].entries);
    })
    .catch((err) => {
      res.status(400).json("Unable to get entries");
    });
};

module.exports = {
  handleImage,
  handleApiCall,
};
