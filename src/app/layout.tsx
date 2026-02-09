import type { Metadata } from "next";
import "./globals.css";
import { ProjectProvider } from "@/contexts/ProjectContext";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@8..144,100..900&family=Prompt:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
