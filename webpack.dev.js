// webpack.dev.js
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    open: true, // otomatis membuka browser
    hot: true, // enable hot module replacement
    port: 8003, // gunakan port 3000 untuk pengembangan
  },
});
