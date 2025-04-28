import { Metadata } from "next";
import "./globals.css"
import { Nunito } from 'next/font/google'
import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/react"

const nunito = Nunito({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: "draft - AI-Powered Game Generator",
  description:
    "Generate and play live browser games with AI. Create, share, and explore interactive game creations with draft.",
  icons: {
    icon: "/favicon.png", // Ensure favicon.png is placed in the public directory
  },
  openGraph: {
    title: "draft - Build and Play AI-Generated Games",
    description:
      "Experience the future of gaming with draft. Generate custom games using AI, play them live in your browser, and share your creations with the community.",
    url: "https://www.createdot.fun/", // Replace with your actual site URL
    siteName: "draft",
    images: [
      {
        url: "/banner.png", // Ensure banner.png is placed in the public directory
        width: 1200,
        height: 630,
        alt: "draft - AI-Powered Game Generator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "draft - AI-Powered Game Generator",
    description:
      "Generate and play live browser games with AI. Join the draft community to create and share interactive game experiences.",
    images: ["/banner.png"], // Twitter uses Open Graph images
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <Analytics/>
      <body className={`${nunito.className} bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
