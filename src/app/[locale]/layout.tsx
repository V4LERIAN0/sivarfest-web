import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      key={locale}
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}