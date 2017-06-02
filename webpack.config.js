/* eslint-disable */
var path = require('path');
var webpack = require("webpack");

module.exports = {
  entry: './client/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/assets/js/dist')
  },
  plugins: [
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
    }),
  ]
};
