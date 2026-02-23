import { Inter } from "next/font/google";
import "./globals.css";
import VirtualAssistant from "@/components/VirtualAssistant";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DataCrypt | Decentralized Science Archive",
  description: "The world's first decentralized archive for negative results. Turn scientific dead-ends into valuable knowledge assets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <VirtualAssistant />
      </body>
    </html>
  );
}
