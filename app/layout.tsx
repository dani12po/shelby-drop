import "./globals.css";

export const metadata = {
  title: "Shelby Drop",
  description: "Upload, download, and share Shelby blobs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
