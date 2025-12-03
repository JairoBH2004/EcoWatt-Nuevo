const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [
      // Ignora las carpetas de build de Android
      /.*\/android\/build\/.*/,
      /.*\/android\/app\/build\/.*/,
      /.*\/node_modules\/.*\/android\/build\/.*/,
    ],
  },
  watchFolders: [__dirname],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);