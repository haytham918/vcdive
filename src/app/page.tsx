import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
    <h1 className="text-4xl font-bold mb-4">
      Welcome to My Themed App
    </h1>
    <p className="mb-8">
      This is a sample app using a custom Tailwind theme with dark mode support.
    </p>
    <ThemeToggle />
  </div>
  );
}
