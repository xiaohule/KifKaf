import { Quasar } from "quasar";
import { boot } from "quasar/wrappers";

export const setQuasarLangPack = async (langIso) => {
  const langList = import.meta.glob('../../node_modules/quasar/lang/(en-US|fr).mjs'); //import.meta.glob('../../node_modules/quasar/lang/(en-US|fr).mjs') will fail if prettier enabled
  try {
    // Dynamically import the language pack based on langIso.
    // Ensure the import promise is awaited and handle the case where the specific langIso file might not exist.
    const langModulePath = `../../node_modules/quasar/lang/${langIso}.mjs`;
    if (langList[langModulePath]) {
      const langModule = await langList[langModulePath]();
      Quasar.lang.set(langModule.default);
    } else {
      // Fallback to a default language or a base language (e.g., en-US or fr) if the specific locale is not available.
      const baseLangModulePath = `../../node_modules/quasar/lang/${langIso.split("-")[0]}.mjs`;
      if (langList[baseLangModulePath]) {
        const langModule = await langList[baseLangModulePath]();
        Quasar.lang.set(langModule.default);
      } else {
        // Final fallback to en-US if neither the specific nor the base language pack is found.
        const fallbackLangModule =
          await langList["../../node_modules/quasar/lang/en-US.mjs"]();
        Quasar.lang.set(fallbackLangModule.default);
        console.log(
          `Fallback to en-US because ${langIso} or base language pack not found.`,
        );
      }
    }
  } catch (err) {
    console.error(`Error setting Quasar language pack for ${langIso}:`, err);
    // Implement fallback logic here if needed.
  }
};

export default boot(async () => {
  const langIso = Quasar.lang.getLocale() ?? "en-US";
  await setQuasarLangPack(langIso);
});
