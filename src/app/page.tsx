/*

  Main Page of the Visual Debugger:
  Layout:
    -- VCDive Animation
    -- Description
    -- Dropzone
    -- Textarea of Result 
    -- Reset Button & Upload Buton
*/
"use client";
import "@/app/home.css";
import FileUpload from "@/components/FileUpload";
import MethodTabs from "@/components/MethodTabs";
import ThemeToggle from "@/components/ThemeToggle";
import { Upload, FileCloud, Files } from "phosphor-react";
import { useState, JSX } from "react";

// Methods for sending the file
export type Method = "drop" | "caen" | "local";
export interface MethodOption {
  label: string;
  value: Method;
  icon: JSX.Element;
}
const available_methods: MethodOption[] = [
  { label: "Drop", value: "drop", icon: <Upload size={25} weight="bold" /> },
  { label: "CAEN", value: "caen", icon: <FileCloud size={25} weight="bold" /> },
  { label: "Local", value: "local", icon: <Files size={25} weight="bold" /> },
];

const Home = () => {
  // State variable for the chosen method
  const [chosen_method, setChosenMethod] = useState<Method>("drop");

  // Button clock handler
  const chosen_method_handler = (method: Method) => {
    setChosenMethod(method);
  };
  return (
    <>
      <header>
        <ThemeToggle />
      </header>
      <main>
        <div className="home">
          <div className="title">
            <h1 className="binary-flip" data-text="VCDive">
              000000
            </h1>
            <h3 className="text-3xl font-bold">Visual Debugger for VCD</h3>
          </div>
          <div className="home-container">
            <MethodTabs
              available_methods={available_methods}
              chosen_method={chosen_method}
              chosen_method_handler={chosen_method_handler}
            />
            <FileUpload />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
