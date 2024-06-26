const {
  injectQuasarDevServerConfig,
} = require("@quasar/quasar-app-extension-testing-e2e-cypress/cct-dev-server");
const { defineConfig } = require("cypress");
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

module.exports = defineConfig({
  chromeWebSecurity: false,
  projectId: "5irsz1",
  fixturesFolder: "test/cypress/fixtures",
  screenshotsFolder: "test/cypress/screenshots",
  videosFolder: "test/cypress/videos",
  video: true,
  viewportWidth: 390,
  viewportHeight: 844,
  e2e: {
    async setupNodeEvents(on, config) {
      // registerCodeCoverageTasks(on, config); //TODO:1 re-enable when ready
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
      on("before:browser:launch", (browser = {}, launchOptions) => {
        // `args` is an array of all the arguments that will
        // be passed to browsers when it launches
        console.log(launchOptions.args); // print all current args

        if (browser.family === "chromium" && browser.name !== "electron") {
          // auto open devtools
          launchOptions.args.push("--auto-open-devtools-for-tabs");
        }

        if (browser.family === "firefox") {
          // auto open devtools
          launchOptions.args.push("-devtools");
        }

        if (browser.name === "electron") {
          // auto open devtools
          launchOptions.preferences.devTools = true;
        }

        // whatever you return here becomes the launchOptions
        return launchOptions;
      });
      // require("cypress-terminal-report/src/installLogsPrinter")(on);
      return config;
    },
    baseUrl: "http://localhost:9200/",
    defaultCommandTimeout: 40000,
    // taskTimeout: 60000,
    animationDistanceThreshold: 0.0,
    waitForAnimations: true,
    supportFile: "test/cypress/support/e2e.js",
    specPattern: "test/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    experimentalWebKitSupport: true,
  },
  component: {
    // setupNodeEvents(on, config) {},
    supportFile: "test/cypress/support/component.js",
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    indexHtmlFile: "test/cypress/support/component-index.html",
    devServer: injectQuasarDevServerConfig(),
  },
});
