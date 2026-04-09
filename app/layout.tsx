import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CatalogStockRefresher from "./components/CatalogStockRefresher";
import { serverApiGet } from "@/lib/server-api";
import { getCurrency } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Mama's Market - Authentic World Flavours in Vaasa",
  description:
    "Mama's Market — your local destination for authentic world flavours in Vaasa. Fresh produce, international groceries, and everyday essentials. Located at Vaasanpuistikko 20, Vaasa.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [scriptsData, currency] = await Promise.all([
    serverApiGet<{ scripts: Record<string, string> }>("/storefront/custom-scripts"),
    getCurrency(),
  ]);
  const scripts = scriptsData?.scripts || {};

  return (
    <html lang="en">
      <head>
        {scripts.custom_scripts_head ? (
          <script dangerouslySetInnerHTML={{ __html: scripts.custom_scripts_head }} />
        ) : null}
      </head>
      <body>
        <CatalogStockRefresher />
        {scripts.custom_scripts_body_start ? (
          <div dangerouslySetInnerHTML={{ __html: scripts.custom_scripts_body_start }} />
        ) : null}
        <LayoutWrapper header={<Header />} footer={<Footer />} currency={currency}>
          {children}
        </LayoutWrapper>
        {scripts.custom_scripts_body_end ? (
          <div dangerouslySetInnerHTML={{ __html: scripts.custom_scripts_body_end }} />
        ) : null}
      </body>
    </html>
  );
}
