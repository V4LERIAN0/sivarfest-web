import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { getMessages } from "./messages";
import { internalDefaultLocale, routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;

  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : internalDefaultLocale;

  return {
    locale,
    messages: getMessages(locale),
    timeZone: "America/El_Salvador",
  };
});