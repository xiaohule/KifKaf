import { boot } from "quasar/wrappers";
import { Quasar } from "quasar";
import { createI18n } from "vue-i18n";
import messages from "src/i18n";

const normalizeLocale = (locale) => {
  if (!locale) return "en-US"; // Default fallback

  const normalized = locale.replace("_", "-").toLowerCase();
  const parts = normalized.split("-");
  if (parts.length === 1) {
    // If only language code is present
    return parts[0] === "en"
      ? "en-US"
      : `${parts[0]}-${parts[0].toUpperCase()}`;
  }
  // If both language and region codes are present
  return `${parts[0]}-${parts[1].toUpperCase()}`;
};

const datetimeFormats = {
  "en-US": {
    longCurrentYear: {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
    longPreviousYears: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
    // long: {
    //   year: 'numeric', month: 'short', day: 'numeric',
    //   weekday: 'short', hour: 'numeric', minute: 'numeric'
    // }
  },
  "fr-FR": {
    longCurrentYear: {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
    longPreviousYears: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  },
};

// Create I18n instance
export const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: normalizeLocale(Quasar.lang.getLocale()),
  fallbackLocale: "en-US",
  globalInjection: true,
  messages,
  datetimeFormats,
  missingWarn: false,
  fallbackWarn: false,
});

export default boot(({ app }) => {
  console.log(
    "In i18nBoot> setting i18n locale to browser locale",
    Quasar.lang.getLocale(),
    "if we support it (fallback to en-US otherwise)",
  );

  // Tell app to use the I18n instance
  app.use(i18n);
});
