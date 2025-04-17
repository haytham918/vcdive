"use client";

/* 
    Main Page button to parse vcd contents
*/
import { useRouter } from "next/navigation";
import { SpinnerGap, KeyReturn } from "phosphor-react";
import { Method } from "@/app/page";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import React from "react";
const ParseButton: React.FC<{
    method: Method;
    uploaded_file: File | null;
    file_name: string;
    is_loading: boolean; // is_loading state from above
    loadingHandler: (loading_val: boolean) => void; // Set loading icon
}> = ({ method, uploaded_file, file_name, is_loading, loadingHandler }) => {
    const router = useRouter();

    const handleButtonClickUpload = async () => {
        // Check if the file is empty
        if (!uploaded_file) {
            toast.error(`Nothing to parse\n`);
            return;
        }
        loadingHandler(true);
        try {
            const formData = new FormData();
            formData.append("file", uploaded_file);

            // Send entire file in one request
            const response = await fetch("/backend/parse/", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) {
                toast.error(`Parsing Failed\n${result.error}`);
                throw new Error(`Error: ${result.error}`);
            }
            toast.success("Parsed Successfully");
            router.push("/debugger/");
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Failed:", error.message);
            }
        } finally {
            loadingHandler(false);
        }
    };

    // Button for the CAEN page
    const handleButtonClickCaen = async () => {
        // Check if the filename is empty
        if (file_name === "") {
            toast.error("No file name");
            return;
        } else if (!file_name.endsWith(".vcd")) {
            toast.error("Only .vcd files are supported");
            return;
        }
        loadingHandler(true);
        try {
            // Do a post request and send the file name
            const response = await fetch("/backend/caen/", {
                method: "POST",
                body: JSON.stringify({ file_name: file_name }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Wait for the backend
            const result = await response.json();
            if (!response.ok) {
                toast.error(`Parsing Failed\n${result.error}`);
                throw new Error(`Error: ${result.error}`);
            }

            console.log(result.message);
            toast.success("Parsed Successfully");
            router.push("/debugger/");
        } catch (error: unknown) {
            if (error instanceof Error) console.log("FAILED: ", error.message);
        } finally {
            loadingHandler(false);
        }
    };

    // Click parse button when it's local
    const handleButtonClickLocal = async () => {
        // Check if the filename is empty
        if (file_name === "") {
            toast.error("No file name");
            return;
        } else if (!file_name.endsWith(".vcd")) {
            toast.error("Only .vcd files are supported");
            return;
        }
        loadingHandler(true);
        try {
            // Do a post request and send the file name
            const response = await fetch("/backend/local/", {
                method: "POST",
                body: JSON.stringify({ file_name: file_name }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Wait for the backend
            const result = await response.json();
            if (!response.ok) {
                toast.error(`Parsing Failed\n${result.error}`);
                throw new Error(`Error: ${result.error}`);
            }

            console.log("Local Successful");
            toast.success("Parsed Successfully");
            router.push("/debugger/");
        } catch (error: unknown) {
            if (error instanceof Error) console.log("FAILED: ", error.message);
        } finally {
            loadingHandler(false);
        }
    };

    let handleButtonClick; // handler for clicking the button, different backend endpoints
    if (method === "drop") {
        handleButtonClick = handleButtonClickUpload;
    } else if (method === "caen") {
        handleButtonClick = handleButtonClickCaen;
    } else {
        handleButtonClick = handleButtonClickLocal;
    }

    // Keyboard for enter
    useEffect(() => {
        const handlePressEnter = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                handleButtonClick();
            }
        };

        window.addEventListener("keydown", handlePressEnter);
        return () => {
            window.removeEventListener("keydown", handlePressEnter);
        };
    }, [handleButtonClick]);

    return (
        <>
            <button
                className="ml-auto btn btn-primary"
                onClick={handleButtonClick}
                disabled={is_loading}
            >
                {!is_loading ? (
                    <p className="w-[180px]">
                        Parse VCD Contents<br></br>
                        <span className="items-center justify-center flex">
                            <KeyReturn weight="bold" size={25} />
                        </span>
                    </p>
                ) : (
                    <SpinnerGap
                        size={25}
                        weight="bold"
                        className="w-[180px] animate-spin"
                    />
                )}
            </button>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        color: "dark-gray",
                        fontWeight: "bold",
                    },
                    success: {
                        style: {
                            background: "beige",
                        },
                    },
                    error: {
                        style: {
                            background: "beige",
                        },
                    },
                }}
            />
        </>
    );
};

export default React.memo(ParseButton);
