module.exports = {
  extends: ["expo", "prettier"],
  rules: {
    "max-lines": ["warn", { max: 200, skipBlankLines: true, skipComments: true }],
    "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true }],
  },
};
