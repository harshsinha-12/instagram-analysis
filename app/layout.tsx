import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instagram Creative Intelligence",
  description: "Competitor organic reel analysis and brand adaptation strategy.",
  openGraph: {
    images: ["/instagram-analyzer-form.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
