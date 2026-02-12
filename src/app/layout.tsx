import type { Metadata } from "next";
import { Inter, Prompt } from "next/font/google"; // Import fonts
import "./globals.css";
import { ProjectProvider } from "@/contexts/ProjectContext";

// Configure fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const prompt = Prompt({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบคำนวณงบประมาณโครงการ",
  description: "Web application for project cost estimation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${inter.variable} font-sans antialiased`}>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
