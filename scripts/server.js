var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var config = require("../webpack.config");

var server = new WebpackDevServer(webpack(config), { // Start a server
  contentBase:"./harness",
  publicPath: config.output.publicPath,
  hot: true, // With hot reloading
  inline: false,
  historyApiFallback: true,
  quiet: false // With logging
}).listen(3000, "localhost", function (err, result) {
  if (err) {
    console.error(err);
  }
  console.info("Listening at localhost:3000");
});