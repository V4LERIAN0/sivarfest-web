import en from "../../messages/en.json";
import es from "../../messages/es.json";
import type { AppLocale } from "./routing";

const messages: Record<AppLocale, typeof en> = {
  en,
  es,
};

export function getMessages(locale: AppLocale) {
  return messages[locale];
}