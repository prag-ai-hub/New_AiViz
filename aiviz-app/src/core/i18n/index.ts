import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

export const SUPPORTED_LANGS = ["en", "hi", "mr"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

const resources: Record<Lang, { translation: Record<string, string> }> = {
  en: { translation: {} },
  hi: { translation: {} },
  mr: { translation: {} },
};

const device = (Localization.getLocales()[0]?.languageCode ?? "en") as Lang;
const initial: Lang = SUPPORTED_LANGS.includes(device) ? device : "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
