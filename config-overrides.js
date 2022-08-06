const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
module.exports = function override(config, env) {
    config.ignoreWarnings = [/Failed to parse source map/];
    config.plugins = (config.plugins || []).concat([
        new NodePolyfillPlugin(),
    ]) 
    return config;
}