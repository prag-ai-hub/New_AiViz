const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Disable Node-style package.exports resolution. A few deps publish ESM-only
// builds via `exports`, which Metro then ships into the web bundle unchanged
// (causing "Cannot use 'import.meta' outside a module" in the browser).
// Falling back to the classic main/module resolution keeps the bundle script-safe.
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });
