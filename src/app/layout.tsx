import "./globals.css";
import Navbar from "../../components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Textile Management System",
  description: "Modern textile management dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-indigo-100 font-sans">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
