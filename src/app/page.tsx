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
import FileCaen from "@/components/FileCaen";
import FileLocal from "@/components/FileLocal";
import FileUpload from "@/components/FileUpload";
import MethodTabs from "@/components/MethodTabs";
import ThemeToggle from "@/components/ThemeToggle";
import { Upload, FileCloud, Files } from "phosphor-react";
import { useState, JSX, useCallback } from "react";

// Methods for sending the file
export type Method = "drop" | "caen" | "local";
export interface MethodOption {
    label: string;
    value: Method;
    icon: JSX.Element;
}
const available_methods: MethodOption[] = [
    {
        label: "CAEN",
        value: "caen",
        icon: <FileCloud size={25} weight="bold" />,
    },
    { label: "Drop", value: "drop", icon: <Upload size={25} weight="bold" /> },
    { label: "Local", value: "local", icon: <Files size={25} weight="bold" /> },
];

const Home = () => {
    // State variable for the chosen method
    const [chosen_method, setChosenMethod] = useState<Method>("caen");

    // File related state variables
    const [file_name, setFileName] = useState("cpu_test.vcd");
    const [uploaded_file_name, setUploadedFileName] = useState("");
    const [is_loading, setLoading] = useState(false);

    // Set file name on CAEN or Local
    const fileNameHandler = useCallback((str: string) => {
        setFileName(str);
    }, []);

    // Set file name for Upload
    const uploadedFileNameHandler = useCallback((str: string) => {
        setUploadedFileName(str);
    }, []);

    // Set Loadin Icon
    const loadingHandler = useCallback((loading_val: boolean) => {
        setLoading(loading_val);
    }, []);

    // Button clock handler
    const chosen_method_handler = useCallback((method: Method) => {
        setChosenMethod(method);
    }, []);

    let file_component; // Main layout depending on the file method
    if (chosen_method === "drop") {
        file_component = (
            <FileUpload
                file_name={uploaded_file_name}
                is_loading={is_loading}
                loadingHandler={loadingHandler}
                fileNameHandler={uploadedFileNameHandler}
            />
        );
    } else if (chosen_method === "caen") {
        file_component = (
            <FileCaen
                file_name={file_name}
                is_loading={is_loading}
                loadingHandler={loadingHandler}
                fileNameHandler={fileNameHandler}
            />
        );
    } else {
        file_component = (
            <FileLocal
                file_name={file_name}
                is_loading={is_loading}
                loadingHandler={loadingHandler}
                fileNameHandler={fileNameHandler}
            />
        );
    }
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
                        <h3 className="text-3xl font-bold">
                            Visual Debugger for VCD
                        </h3>
                    </div>
                    <div className="home-container">
                        <MethodTabs
                            available_methods={available_methods}
                            chosen_method={chosen_method}
                            chosen_method_handler={chosen_method_handler}
                        />
                        {file_component}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Home;
