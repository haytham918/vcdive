import type { Metadata } from "next";
import { Poppins, Ubuntu } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: "500",
  variable: "--font-poppins",
  subsets: ["latin"],
});
const ubuntu = Ubuntu({
  weight: "700",
  variable: "--font-ubuntu",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "VCDive",
  description: "A Visual Debugger with VCD Files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${ubuntu.variable} bg-background`}
      >
        {children}
      </body>
    </html>
  );
}
