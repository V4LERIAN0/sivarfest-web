import { getRequestConfig } from "next-intl/server";
import { getMessages } from "./messages";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  const locale = routing.defaultLocale;

  return {
    locale,
    messages: getMessages(locale),
    timeZone: "America/El_Salvador",
  };
});