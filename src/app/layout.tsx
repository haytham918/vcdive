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

// Global Layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function() {
      const theme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || (!theme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${poppins.variable} ${ubuntu.variable} bg-background`}>
        {children}
        <footer className="opacity-50 flex flex-col p-1 font-[ubuntu] text-center w-full flex-shrink-0 mt-8">
          <span>
            Shourya Bansal, Ayan Chowdhury, Aaron Rahman, Haytham Tang, Akshay
            Tate, Ivan Wei
          </span>
          <span>
            &#169; Kris and Ron's Biggest Fans (EECS470-WN25). All Rights
            Reserved
          </span>
        </footer>
      </body>
    </html>
  );
}
