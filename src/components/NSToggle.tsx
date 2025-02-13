"use client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useState } from "react";

type NumberSystem = "0d" | "0x"; // Maybe binary in the future

interface NSOption {
  sys: NumberSystem;
  label: string;
}

const NSItems: NSOption[] = [
  { sys: "0d", label: "0d' Decimal" },
  { sys: "0x", label: "0x' Hexadecimal" },
];

const NSToggle = () => {
  const [selected_number_sys, setNumberSys] = useState<NumberSystem>("0x");

  const handleClick = (val: NumberSystem) => {
    setNumberSys(val);
  };

  return (
    <Menu
      as="div"
      className="absolute inline-block text-left font-bold right-[70px]"
    >
      <MenuButton className="w-[30px]flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-babyblue text-white hover:bg-babyblue-hover focus:outline-none">
        {selected_number_sys}
        <MenuItems
          anchor="bottom end"
          className="absolute right-4 w-[160px] h-[73px] rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10"
        >
          {NSItems.map((item: NSOption) => (
            <MenuItem key={item.sys}>
              {({ focus }) => (
                <button
                  onClick={() => setNumberSys(item.sys)}
                  className={`flex font-bold w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 overflow-hidden ${
                    focus ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                >
                  {item.label}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </MenuButton>
    </Menu>
  );
};

export default NSToggle;
