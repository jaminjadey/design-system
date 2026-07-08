export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["**/.turbo/**", "**/dist/**", "**/node_modules/**", "**/storybook-static/**"],
  rules: {
    "color-no-hex": [
      true,
      {
        message: "Use generated --ds-* token variables instead of hardcoded hex colours."
      }
    ],
    "declaration-property-value-disallowed-list": {
      "/.*/": ["/#[0-9a-fA-F]{3,8}\\b/", "/\\b(?:rgb|rgba|hsl|hsla)\\(/i"]
    },
    "selector-class-pattern": null
  }
};
