var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require("webpack");
var WebpackStrip = require('strip-loader');
var package = require("./package.json");
var childProcess = require("child_process");

var node_env = process.env.NODE_ENV;
var source_url = process.env.SOURCE_URL;
var virtual_device_url = process.env.VIRTUAL_DEVICE_URL;
var monitor_api_url = process.env.MONITOR_API_URL;
var pusher_app_key = process.env.PUSHER_APP_KEY;
var projectName = "dashboard";
var version = package.version;
var buildNumber = process.env.TRAVIS_BUILD_NUMBER;
var buildId = process.env.TRAVIS_BUILD_ID
var git_hash = childProcess.execSync("git rev-parse HEAD").toString();
var intercom_app_id_prod = process.env.INTERCOM_APP_ID_PROD;
var intercom_app_id_dev = process.env.INTERCOM_APP_ID_DEV;
var source_url = process.env.SOURCE_URL;

var stripe_url = process.env.STRIPE_API_URL;

var logless_base = "";
var source_api_access_token = process.env.SOURCE_API_ACCESS_TOKEN;
var firebase_api_key = "AIzaSyBfHBDy0cVUYnBL4l6_9RYubIdZSC3fG-A";
var firebase_auth_domain = "dev-bespoken-tools.firebaseapp.com";
var firebase_database_url = "https://dev-bespoken-tools.firebaseio.com";
var firebase_storage_bucket = "dev-bespoken-tools.appspot.com";
var firebase_messaging_sender_id = "686431405396";
var travis_tag = process.env.TRAVIS_TAG;
if (travis_tag) {
  const env = travis_tag.match(/^(prod|dev).*$/);
  if (env && env.length === 2 && env[1] === "dev") {
    logless_base = "https://logless-dev.bespoken.tools/v1";
  }
  if (env && env.length === 2 && env[1] === "prod") {
    firebase_api_key = "AIzaSyB1b8t0rbf_x2ZEhJel0pm6mQ4POZLgz-k";
    firebase_auth_domain = "bespoken-tools.firebaseapp.com";
    firebase_database_url = "https://bespoken-tools.firebaseio.com";
    firebase_storage_bucket = "bespoken-tools.appspot.com";
    firebase_messaging_sender_id = "629657216103";
    monitor_api_url = "https://monitor-api.bespoken.tools";
  }
}

// A couple of default buildVariables, these are then made available
// within the project.  Make sure they are also declared in typings/config.d.ts
// to let TypeScript know about them.
var buildVariables = {
  'process.env': {
    NODE_ENV: JSON.stringify(node_env),
    LOGLESS_BASE: JSON.stringify(logless_base),
    SOURCE_URL: JSON.stringify(source_url),
    SOURCE_API_ACCESS_TOKEN: JSON.stringify(source_api_access_token),
    VIRTUAL_DEVICE_URL: JSON.stringify(virtual_device_url),
    MONITOR_API_URL: JSON.stringify(monitor_api_url),
    PUSHER_APP_KEY: pusher_app_key ? JSON.stringify(pusher_app_key) : JSON.stringify("f633d48c65e61876b8df"),
    GIT_HASH: JSON.stringify(git_hash),
    FIREBASE_API_KEY: JSON.stringify(firebase_api_key),
    FIREBASE_AUTH_DOMAIN: JSON.stringify(firebase_auth_domain),
    FIREBASE_DATABASE_URL: JSON.stringify(firebase_database_url),
    FIREBASE_STORAGE_BUCKET: JSON.stringify(firebase_storage_bucket),
    FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(firebase_messaging_sender_id),
    INTERCOM_APP_ID_PROD: JSON.stringify(intercom_app_id_prod),
    INTERCOM_APP_ID_DEV: JSON.stringify(intercom_app_id_dev),
    STRIPE_API_URL: JSON.stringify(stripe_url),
  },
  'BASENAME': JSON.stringify("/dashboard"),
  'GOOGLE_ANALYTICS': JSON.stringify(""),
  'VERSION': JSON.stringify(version),
  'BUILD_NUMBER': JSON.stringify(buildNumber),
  'BUILD_ID': JSON.stringify(buildId),
  'LOGLESS_BASE': JSON.stringify(logless_base),
}

// A list of plugins
var plugins = [];

// If it is production
if (node_env === "production") {
  // For production postfix min to the file names
  projectName += ".min";
  buildVariables.GOOGLE_ANALYTICS = JSON.stringify("UA-40630247-7");
  // Add the production plugins
  plugins.push(new webpack.optimize.UglifyJsPlugin());
}

// Used by our dev instances
if (node_env === "development") {
  buildVariables.BASENAME = JSON.stringify("/");
}

// Now that everything is configured, add the plugins
plugins.push(new ExtractTextPlugin("style/" + projectName + ".css", { allChunks: true }))
plugins.push(new webpack.DefinePlugin(buildVariables));

var moduleLoaders = [];
// All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
moduleLoaders.push({
  test: /\.tsx?$/,
  loader: "ts-loader"
});
// Styling loader for scss and css files.
moduleLoaders.push({
  test: /\.(scss|css)$/,
  loader: ExtractTextPlugin.extract('style', 'typings-for-css-modules?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass')
});
// This loader will strip out all console methods.  We don't care if it's in development.
if (node_env === "production") {
  moduleLoaders.push({
    test: /\.tsx?$/,
    loader: "strip-loader?strip[]=debug,strip[]=console.log,strip[]=console.info,strip[]=console.debug,strip[]=console.time,strip[]=console.timeEnd"
  });
}

// The remaining webpack config
var config = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "scripts/" + projectName + ".js?v1",
  },
  // Enable sourcemaps for debugging webpack's output.
  // devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".scss", ".css", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ]
  },

  module: {
    loaders: moduleLoaders,

    sassLoader: {
      data: '@import "' + path.resolve(__dirname, 'theme/_theme.scss') + '";'
    },

    /*
    preLoaders: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
    */
  },

  plugins: plugins,
}

module.exports = config;
