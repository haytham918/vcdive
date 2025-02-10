import ThemeToggle from "@/components/ThemeToggle";

// Layout for home page, there is only theme toggle
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <ThemeToggle />
      </header>
      <main>{children}</main>
    </>
  );
}
