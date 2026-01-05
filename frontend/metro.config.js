const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Add WatermelonDB support
  config.resolver.sourceExts = [...config.resolver.sourceExts, 'sql'];

  return config;
})();
