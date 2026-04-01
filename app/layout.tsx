import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BranchCookieSync from "./components/BranchCookieSync";
import CatalogStockRefresher from "./components/CatalogStockRefresher";
import { serverApiGet } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Cleanshelf Supermarket - Shop More for Less",
  description:
    "Cleanshelf Supermarket - Your daily fresh grocery needs in Nairobi. Fresh vegetables, fruits, dairy, meats and more at the best prices. Located off Chiromo Road, Westlands.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const scriptsData = await serverApiGet<{ scripts: Record<string, string> }>("/storefront/custom-scripts");
  const scripts = scriptsData?.scripts || {};

  return (
    <html lang="en">
      <head>
        {scripts.custom_scripts_head ? (
          <script dangerouslySetInnerHTML={{ __html: scripts.custom_scripts_head }} />
        ) : null}
      </head>
      <body>
        <BranchCookieSync />
        <CatalogStockRefresher />
        {scripts.custom_scripts_body_start ? (
          <div dangerouslySetInnerHTML={{ __html: scripts.custom_scripts_body_start }} />
        ) : null}
        <LayoutWrapper header={<Header />} footer={<Footer />}>
          {children}
        </LayoutWrapper>
        {scripts.custom_scripts_body_end ? (
          <div dangerouslySetInnerHTML={{ __html: scripts.custom_scripts_body_end }} />
        ) : null}
      </body>
    </html>
  );
}
