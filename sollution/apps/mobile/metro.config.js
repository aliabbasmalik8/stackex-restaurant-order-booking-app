const { getDefaultConfig } = require('expo/metro-config');
const { withStackExMetro } = require('@stackex/toolkit-sdk/metro');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Native Stripe SDK has no web build — stub so Expo web can bundle.
  if (platform === 'web' && moduleName === '@stripe/stripe-react-native') {
    return { type: 'empty' };
  }

  if (typeof upstreamResolveRequest === 'function') {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withStackExMetro(config);
