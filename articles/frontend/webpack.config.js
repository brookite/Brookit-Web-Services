const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const mode = "development";
const isDev = mode == "development";

const plugins = [
  new HtmlWebpackPlugin({
    template: "./src/index.html",
    inject: "body",
    minify: {
      collapseWhitespace: !isDev,
    },
  }),
  new MiniCssExtractPlugin({ filename: "articles.css" }),
];

module.exports = {
  mode: mode,
  entry: "./src/index.js",
  output: {
    filename: "articles.js",
    path: path.resolve("../static"),
    clean: true,
  },
  devtool: "inline-source-map",
  devServer: {
    port: 4200,
    hot: isDev,
  },
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: "file-loader?name=[name].[ext]",
          },
        ],
      },
      {
        test: /\.(jpg|png|svg|gif)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]",
        },
      },
    ],
  },
};
