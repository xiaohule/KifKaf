import { boot } from "quasar/wrappers";
import * as SentryVue from "@sentry/vue";

//TODO:5 tree shake sentry https://docs.sentry.io/platforms/javascript/guides/vue/configuration/tree-shaking/?
export default boot(({ app, router }) => {
  if (process.env.MODE !== "capacitor") {
    // console.log("In firebaseBoot, will init Sentry for web");
    SentryVue.init({
      app,
      dsn: "https://14d302e6de1ed16a581dea3f4d90aec6@o4506138007961600.ingest.sentry.io/4506138013204480",
      release: `kifkaf-app@${process.env.__APP_VERSION__}`,
      dist: process.env.__BUILD_NUMBER__,
      environment: process.env.NODE_ENV,
      // debug: process.env.NODE_ENV === "development", //To remove before prod
      integrations: [
        SentryVue.browserTracingIntegration({ router }),
        SentryVue.replayIntegration({
          // Additional SDK configuration goes in here, for example:
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.5, // Capture x% of the transactions
      // Session Replay
      replaysSessionSampleRate: 0.2, // This sets the sample rate at x%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      tracePropagationTargets: [
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        "localhost",
        /^\//,
        // "https://kifkaf.app/api",
        /^https:\/\/kifkaf\.app\/api/,
      ],
    });
    console.log("In sentryBoot, Sentry initialized for web");
  } else {
    import("@sentry/capacitor")
      .then((module) => {
        console.log("SentryCapacitor module:", module);
        const SentryCapacitor = module;
        SentryCapacitor.init(
          {
            app,
            // dsn: "https://14d302e6de1ed16a581dea3f4d90aec6@o4506138007961600.ingest.sentry.io/4506138013204480",
            dsn: "https://c2f9d0933e8f0e2fa9ddcf74448d9f2d@o4506138007961600.ingest.sentry.io/4506139126071296",
            release: `kifkaf-app@${process.env.__APP_VERSION__}`,
            dist: process.env.__BUILD_NUMBER__,
            environment: process.env.NODE_ENV,
            // debug: process.env.NODE_ENV === "development", //To remove before prod
            trackComponents: true,
            integrations: [
              // Registers and configures the Tracing integration,
              // which automatically instruments your application to monitor its
              // performance, including custom Angular routing instrumentation
              SentryVue.browserTracingIntegration({ router }),
              SentryVue.replayIntegration({
                // Additional SDK configuration goes in here, for example:
                maskAllText: false,
                blockAllMedia: false,
              }),
            ],
            // Performance Monitoring
            tracesSampleRate: 0.5, // Capture x% of the transactions
            // Session Replay
            replaysSessionSampleRate: 0.2, // This sets the sample rate at x%. You may want to change it to 100% while in development and then sample at a lower rate in production.
            replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
            tracePropagationTargets: [
              // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
              "localhost",
              /^\//,
              // "https://kifkaf.app/api",
              /^https:\/\/kifkaf\.app\/api/,
            ],
          },
          SentryVue.init,
        );
        console.log("In sentryBoot, Sentry initialized for capacitor");
      })
      .catch((error) => {
        console.error(
          "In sentryBoot, Failed to initialize Sentry for Capacitor, error:",
          error,
        );
      });
  }
});
