const path = require("path");
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "music.js",
    path: path.resolve("../static/js"),
  },
};
