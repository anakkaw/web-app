import type { Metadata } from "next";
import { Prompt } from "next/font/google"; // Import fonts
import "./globals.css";
import { ProjectProvider } from "@/contexts/ProjectContext";

// Configure fonts
const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
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
      <body className={`${prompt.variable} ${prompt.className} antialiased`}>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
