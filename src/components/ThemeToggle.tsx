"use client";
/*
    The Component used to Switch Theme
*/
import { useEffect, useState, JSX } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Sun, Moon, Desktop } from "phosphor-react";
import { get_cookie, set_cookie } from "@/lib/utils";
import React from "react";
type ThemeOption = "light" | "dark" | "system";

interface ThemeItem {
    label: string;
    value: ThemeOption;
    icon: JSX.Element;
}

// Three options for theme
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

    // Check if there is local storage cache of the setting
    // If not, go with the default
    useEffect(() => {
        const storedTheme = get_cookie("theme") as ThemeOption | null;
        setTheme(storedTheme || "system");
    }, []);

    // Update the theme whenever user changes it
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
            set_cookie("theme", theme);
        }
    }, [theme]);

    const currentOption = theme_items.find((opt) => opt.value === theme);

    return (
        <Menu
            as="div"
            className="ml-auto relative inline-block text-left font-bold mr-2"
        >
            <MenuButton className="w-[55px] flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-babyblue text-white hover:bg-babyblue-hover focus:outline-none">
                {currentOption ? currentOption.icon : "Mode"}
            </MenuButton>

            <MenuItems className="absolute right-0 w-40 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10">
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

export default React.memo(ThemeToggle);
