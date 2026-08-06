const { getDefaultConfig } = require('expo/metro-config');
const { withStackExMetro } = require('@stackex/toolkit-sdk/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const sharedRoot = path.resolve(monorepoRoot, 'shared');

const config = getDefaultConfig(projectRoot);

// Watch shared package for changes
config.watchFolders = [sharedRoot];

// Resolve modules from mobile's own node_modules only
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Resolve @repo/shared imports to the shared source folder
config.resolver.extraNodeModules = {
  '@repo/shared': sharedRoot,
};

module.exports = withStackExMetro(config);
