import { Quasar } from "quasar";

export const setQuasarLangPack = async (langIso) => {
  const langList = import.meta.glob('../../node_modules/quasar/lang/(en-US|fr).mjs'); //import.meta.glob('../../node_modules/quasar/lang/(en-US|fr).mjs') will fail if prettier enabled
  try {
    langList[`../../node_modules/quasar/lang/${langIso}.mjs`]().then((lang) => {
      Quasar.lang.set(lang.default);
    });
  } catch (error) {
    try {
      langList[
        `../../node_modules/quasar/lang/${langIso.split("-")[0]}.mjs`
      ]().then((lang) => {
        Quasar.lang.set(lang.default);
      });
    } catch (err) {
      console.error(
        `In quasarLangPackBoot > Language pack for ${langIso} not found.`,
        err,
      );
    }
  }
};

export default async () => {
  const langIso = Quasar.lang.getLocale() ?? "en-US"; // ... some logic to determine it (use Cookies Plugin?)

  await setQuasarLangPack(langIso);
};
