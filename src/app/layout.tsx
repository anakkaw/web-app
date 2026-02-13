import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Thai } from "next/font/google"; // Import fonts
import "./globals.css";
import { ProjectProvider } from "@/contexts/ProjectContext";

// Configure fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexThai = IBM_Plex_Sans_Thai({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-ibm-plex-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบบริหารจัดการโครงการ",
  description: "Web application for project cost estimation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${ibmPlexThai.variable} ${inter.variable} font-sans antialiased`}>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
