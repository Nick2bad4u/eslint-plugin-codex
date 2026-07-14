import sharedConfig from "stylelint-config-nick2bad4u";

const unsupportedPlugins = new Set([
    "stylelint-plugin-container-query-sanity",
    "stylelint-plugin-css-performance-budget",
    "stylelint-plugin-docusaurus",
    "stylelint-plugin-font",
    "stylelint-plugin-grid",
]);

const normalizedPlugins = Array.isArray(sharedConfig.plugins)
    ? sharedConfig.plugins.filter(
          (entry) => typeof entry === "string" && !unsupportedPlugins.has(entry)
      )
    : sharedConfig.plugins;

/** @type {import("stylelint").Config} */
const stylelintConfig = {
    ...sharedConfig,
};

if (normalizedPlugins !== undefined) {
    stylelintConfig.plugins = normalizedPlugins;
}

export default stylelintConfig;
