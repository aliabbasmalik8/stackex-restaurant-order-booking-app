const { getDefaultConfig } = require('expo/metro-config');
const { withStackExMetro } = require('@stackex/toolkit-sdk/metro');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

module.exports = withStackExMetro(config);
