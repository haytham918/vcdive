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
  { label: "Light", value: "light", icon: <Sun size={25} weight="bold" /> },
  { label: "Dark", value: "dark", icon: <Moon size={25} weight="bold" /> },
  {
    label: "System",
    value: "system",
    icon: <Desktop size={25} weight="bold" />,
  },
];

const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeOption | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as ThemeOption | null;
    setTheme(storedTheme || "system");
  }, []);

  useEffect(() => {
    if (theme) {
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
    }
  }, [theme]);

  const currentOption = theme_items.find((opt) => opt.value === theme);

  return (
    <Menu as="div" className="relative inline-block text-center font-bold">
      <MenuButton className="w-[128px] flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-primary text-white hover:bg-primary/80 focus:outline-none">
        {currentOption ? (
          <>
            {currentOption.icon}
            <span className="ml-2">{currentOption.label}</span>
          </>
        ) : (
          "Appearance"
        )}
      </MenuButton>
      <MenuItems className="self-center absolute right-0 mt-2 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10">
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
