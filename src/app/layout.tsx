import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NotificationContainer from "@/components/common/notifications/NotificationContainer";

const epilogue = localFont({
  src: [
    {
      path: "../../public/assets/fonts/Epilogue/Epilogue-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Epilogue/Epilogue-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bloc. Gelato - Enterprise Gelateria System",
  description: "Enterprise ERP and POS management system for Bloc. Gelato",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${epilogue.variable} h-full antialiased`}>
      <body className="min-h-screen bg-bloc-cream text-bloc-navy font-sans antialiased flex flex-col">
        {children}
        <NotificationContainer />
      </body>
    </html>
  );
}
