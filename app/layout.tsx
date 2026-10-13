import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CookMama - Cook, Play, Learn",
  description: "Learn to cook through fun gameplay and unlock real recipes!",
  icons: {
    icon: "/logo.png"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          <div className={inter.className}>{children}</div>
        </ClientLayout>
      </body>
    </html>
  );
}
