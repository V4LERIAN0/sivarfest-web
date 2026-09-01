import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
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
  return (
    <html lang={routing.defaultLocale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}