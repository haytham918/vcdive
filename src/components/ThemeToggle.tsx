"use client";

import { useEffect, useState, JSX } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Sun, Moon, Desktop } from "phosphor-react";

type ThemeOption = "light" | "dark" | "system";

interface ThemeItem {
  label: string;
  value: ThemeOption;
  icon: JSX.Element;
}

const theme_items: ThemeItem[] = [
  { label: "Light", value: "light", icon: <Sun size={20} weight="regular" /> },
  { label: "Dark", value: "dark", icon: <Moon size={20} weight="regular" /> },
  {
    label: "System",
    value: "system",
    icon: <Desktop size={20} weight="regular" />,
  },
];

const ThemeToggle = () => {
  // Initialize theme as light or dark
  const [theme, setTheme] = useState<ThemeOption>("system");

  // Check and Set Theme
  useEffect(() => {
    // Check if the user has stored theme in local storage
    const storedTheme = localStorage.getItem("theme") as ThemeOption | null;

    // If there is stored theme, set accordingly
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  // Update the page theme once the theme is changed
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Button function to switch theme

  console.log();

  const current_option =
    theme_items.find((opt) => opt.value === theme) || theme_items[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="inline-flex items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-primary text-white hover:bg-primary/80 focus:outline-none">
        {current_option.icon}
        <span className="ml-2">{current_option.label}</span>
      </MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10">
        {theme_items.map((option) => (
          <MenuItem key={option.value}>
            {({ focus }) => (
              <button
                onClick={() => setTheme(option.value)}
                className={`flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 ${
                  focus ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
              >
                {option.icon}
                <span className="ml-2">{option.label}</span>
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};

export default ThemeToggle;
