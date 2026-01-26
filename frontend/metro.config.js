const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Add WatermelonDB support
  config.resolver.sourceExts = [...config.resolver.sourceExts, 'sql'];

  // Block problematic modules for web builds
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Block better-sqlite3 and sqlite-related modules on web
    if (platform === 'web') {
      if (
        moduleName === 'better-sqlite3' ||
        moduleName.includes('sqlite-node') ||
        moduleName.includes('adapters/sqlite')
      ) {
        return {
          type: 'empty',
        };
      }
    }

    // Use default resolution for everything else
    return context.resolveRequest(context, moduleName, platform);
  };

  return config;
})();
