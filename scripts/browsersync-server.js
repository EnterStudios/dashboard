// Gets called when running npm start
// Followed recipe at https://github.com/BrowserSync/recipes/blob/master/recipes/webpack.typescript/app.js
// Also needed history API for SPA as outlined https://github.com/BrowserSync/browser-sync/issues/204

var browserSync          = require('browser-sync').create();
var webpack              = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var historyApiFallback   = require('connect-history-api-fallback')
var stripAnsi            = require('strip-ansi');

var webpackConfig        = require('../webpack.config');
var bundler              = webpack(webpackConfig);

/**
 * Reload all devices when bundle is complete
 * or send a fullscreen error message to the browser instead
 */
bundler.plugin('done', function (stats) {
    if (stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
            title: "Webpack Error:",
            body:  stripAnsi(stats.toString()),
            timeout: 100000
        });
    }
    browserSync.reload();
});

/**
 * Run Browsersync and use middleware for Hot Module Replacement
 */
browserSync.init({
    server: 'harness',
    open: false,
    logFileChanges: true,
    middleware: [
        webpackDevMiddleware(bundler, {
            publicPath: webpackConfig.output.publicPath,
            progress: true,
            inline: true,
            hot: true,
            stats: {colors: true}
        }),
        historyApiFallback()
    ],
    plugins: ['bs-fullscreen-message'],
    files: [
        'harness/css/*.css',
        'harness/*.html'
    ]
});