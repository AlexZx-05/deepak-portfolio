import type { Metadata } from "next";
import "../../assets/css/style.css";
import "./admin.css";
import { getPortfolioContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { siteContent } = await getPortfolioContent();
  return {
    title: siteContent.seo.title,
    description: siteContent.seo.description
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
