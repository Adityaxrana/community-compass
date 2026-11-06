import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import StoreHydrator from "@/components/StoreHydrator";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  title: "Builder Compass — AWS re:Invent planner",
  description:
    "An independent, unofficial AWS re:Invent session planner. Browse the catalog, build a conflict-free schedule across venues, and export a trip report.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply saved/system theme before paint to avoid a light flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("bc-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface text-ink">
        <StoreHydrator />
        <Sidebar />
        <div className="md:pl-60">
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
          <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted md:px-8">
            Builder Compass is an independent, unofficial planner. Not
            affiliated with or endorsed by Amazon Web Services.
          </footer>
        </div>
      </body>
    </html>
  );
}
