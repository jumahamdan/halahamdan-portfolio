import type { Metadata } from "next";
import { Varela_Round, Nunito_Sans, Caveat } from "next/font/google";
import "./globals.css";

const varelaRound = Varela_Round({
  weight: "400",
  variable: "--font-varela-round",
  subsets: ["latin"],
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hala Hamdan | Elementary Education Teacher",
  description:
    "Elementary education teacher passionate about creating engaging, inclusive learning experiences. Interactive learning tools for multiplication, sight words, and more.",
  keywords: [
    "elementary education",
    "teacher portfolio",
    "learning tools",
    "multiplication practice",
    "sight words",
    "Hala Hamdan",
  ],
  openGraph: {
    title: "Hala Hamdan | Elementary Education Teacher",
    description:
      "Creating engaging, inclusive learning experiences for young minds.",
    url: "https://halahamdan.com",
    siteName: "Hala Hamdan",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${varelaRound.variable} ${nunitoSans.variable} ${caveat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
