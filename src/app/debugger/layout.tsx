import ThemeToggle from "@/components/ThemeToggle";
import "../globals.css";

// Define the Layout for the Debugger (additional stuff for header)
export default function DebuggerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <div>Good Lord</div>
        <ThemeToggle />
      </header>
      <main>{children}</main>
    </>
  );
}
