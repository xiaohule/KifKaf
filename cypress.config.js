const registerCodeCoverageTasks = require("@cypress/code-coverage/task");
const {
  injectQuasarDevServerConfig,
} = require("@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server");
const { defineConfig } = require("cypress");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

module.exports = defineConfig({
  projectId: "5irsz1",
  fixturesFolder: "test/cypress/fixtures",
  screenshotsFolder: "test/cypress/screenshots",
  videosFolder: "test/cypress/videos",
  video: true,
  e2e: {
    setupNodeEvents(on, config) {
      // registerCodeCoverageTasks(on, config); //TODO: re-enable when ready
      const options = {
        webpackOptions: {
          resolve: {
            extensions: [".ts", ".js"],
          },
          module: {
            rules: [
              {
                test: /\.m?js/,
                resolve: {
                  fullySpecified: false,
                },
              },
              {
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                  {
                    loader: "babel-loader",
                    options: {
                      presets: [
                        [
                          "@babel/preset-env",
                          {
                            targets: {
                              node: "current",
                              esmodules: true,
                            },
                          },
                        ],
                        "@babel/preset-typescript",
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      };
      on("file:preprocessor", webpackPreprocessor(options));
      return config;
    },
    baseUrl: "http://localhost:9200/",
    supportFile: "test/cypress/support/e2e.js",
    specPattern: "test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    experimentalWebKitSupport: true,
  },
  component: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);
      return config;
    },
    supportFile: "test/cypress/support/component.js",
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    indexHtmlFile: "test/cypress/support/component-index.html",
    devServer: injectQuasarDevServerConfig(),
  },
});
