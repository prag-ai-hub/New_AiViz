module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@/core": "./src/core",
            "@/shared": "./src/shared",
            "@/features": "./src/features",
            "@/integrations": "./src/integrations",
            "@/workers": "./src/workers",
          },
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
