import ThemeToggle from "@/components/ThemeToggle";
import "../globals.css";
import DebuggerHeader from "@/components/DebuggerHeader";

// Define the Layout for the Debugger (additional stuff for header)
export default function DebuggerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header>
        <DebuggerHeader />
        <ThemeToggle />
      </header>
      <main>{children}</main>
    </>
  );
}
