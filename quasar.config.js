/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const { configure } = require("quasar/wrappers");
const path = require("path");
const { sentryVitePlugin } = require("@sentry/vite-plugin");

// console.log("In quasar.config.js, process.env is", process.env);

module.exports = configure(function (ctx) {
  console.log(ctx);

  return {
    eslint: {
      // fix: true,
      // include: [],
      // exclude: [],
      // rawOptions: {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli/prefetch-feature
    preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli/boot-files
    boot: [
      "sentryBoot",
      "i18nBoot",
      "quasarLangPackBoot",
      "firebaseBoot",
      "browserAddressbarColor",
      "swiperBoot",
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ["app.scss"],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      "roboto-font", // optional, you are not bound to it
      "material-icons", // optional, you are not bound to it
      "material-icons-outlined",
      "material-icons-round",
      "fontawesome-v6",
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      // APP VERSION
      env: {
        __APP_VERSION__: require("./package.json").version,
        __BUILD_NUMBER__: require("./package.json").buildNumber,
        API_URL: ctx.dev
          ? ctx.mode.capacitor
            ? "http://192.168.1.51:3000"
            : "http://localhost:3000"
          : "https://www.kifkaf.app", // "https://lemon-bay-09625be03.3.azurestaticapps.net",
      },
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },
      vueRouterMode: "hash", // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      extendViteConf(viteConf, { isServer, isClient }) {
        viteConf.build.sourcemap = true;

        // //attempt to hide logs in prod
        // drop: ["console", "debugger"],
        viteConf.esbuild = {
          drop: ["console"],
        };
        // //make log silent in prod
        // viteConf.logLevel = "silent";

        viteConf.plugins.push(
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: "kifkaf",
            project: "javascript-vue",
          }),
        );

        viteConf.optimizeDeps = {
          entries: [
            // "tests/cypress/**/*.js",
            "test/cypress/**/*.{js,jsx,ts,tsx}",
            "**/*.cy.{js,jsx,ts,tsx}",
            "src/**/*.{js,jsx,ts,tsx,vue}",
            "index.html",
          ],
          // include: [
          //   "@capacitor",
          //   "@capacitor-firebase",
          //   "@capacitor-community",
          // ],
        };
      },
      viteVuePluginOptions: {
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith("swiper-"),
          },
        },
      },
      alias: {
        "@capacitor": path.resolve(
          __dirname,
          "src-capacitor/node_modules/@capacitor",
        ),
        "@capacitor-firebase": path.resolve(
          __dirname,
          "src-capacitor/node_modules/@capacitor-firebase",
        ),
        "@capacitor-community": path.resolve(
          __dirname,
          "src-capacitor/node_modules/@capacitor-community",
        ),
        "@sentry/capacitor": path.resolve(
          __dirname,
          "src-capacitor/node_modules/@sentry/capacitor",
        ),
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true, enable so that Workbox will load your service workers during quasar dev
      open: true, // opens browser window automatically
      // port: ctx.mode.spa ? 9000 : ctx.mode.pwa ? 9200 : 8080,
      // port: 9200,

      // proxy all calls to /api to http://localhost:3000/api
      proxy: {
        "/api": {
          target: ctx.mode.capacitor
            ? "http://192.168.1.51:3000" //attribuer bail static (dhcp reservation from fbx settings http://192.168.1.254/) to wifi mac address if needed
            : "http://localhost:3000",
          // target: "http://192.168.1.12:3000", //"http://localhost:3000",
          changeOrigin: true,
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      plugins: ["Notify", "AddressbarColor"],
      config: {
        notify: {
          /* look at QuasarConfOptions from the API card */
        },
      },

      // iconSet: 'material-icons', // Quasar icon set
      // lang: 'en-US', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // plugins: ["Firebase"],
    },

    // animations: "all", // --- includes all animations readd if needed
    // https://v2.quasar.dev/options/animations
    // animations: [], //Or use this instead, for ex. animations: ['bounceInLeft','bounceOutRight']

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#property-sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        "render", // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: "generateSW", // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: "sw.js",
      manifestFilename: "manifest.json",
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: false,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: "packager", // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: "kifkaf-app",
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ["my-content-script"],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
