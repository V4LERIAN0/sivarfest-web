import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { DocumentLanguage } from "@/components/i18n/DocumentLanguage";

import "./globals.css";

export const metadata: Metadata = {
  title: "SIVARFEST",
  description: "SivarFest competition portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <DocumentLanguage />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
