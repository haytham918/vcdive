"use client";

import DebuggerHeader from "@/components/DebuggerHeader";
import InstructionQueue from "@/components/processor_components/InstructionQueue";
import PRF_ReadyList from "@/components/processor_components/PRF_ReadyList";
import ReorderBuffer from "@/components/processor_components/ReorderBuffer";
import ThemeToggle from "@/components/ThemeToggle";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
/*

    Page for the /debugger

*/
export type NumberSystem = "0d" | "0x"; // Maybe binary in the future

const DebuggerPage = () => {
    const [selected_number_sys, setNumberSys] = useState<NumberSystem>("0x"); // Number System
    const [file_name, setFileName] = useState(""); // File Name for current parsed file
    const [include_neg, setIncludeNeg] = useState(false); // Whether include neg edge
    const [num_pos_clocks, setNumPosClocks] = useState(0); // Number of positive clocks
    const [num_neg_clocks, setNumNegClocks] = useState(0); // Number of all clocks
    const [cur_cycle, setCurCycle] = useState(0);
    const [cycle_data, setCycleData] = useState({});

    // Update number system
    const numberSysHandler = (preference: NumberSystem) => {
        setNumberSys(preference);
    };

    // The max cycle index based on including neg edges or not
    const end_cycle_index = include_neg
        ? num_neg_clocks - 1
        : num_pos_clocks - 1;

    const negFlipHandler = () => {
        setIncludeNeg(!include_neg);
    };

    // Handler function to set the current cycle
    const cycleHandler = useCallback((cycle: number) => {
        setCurCycle(cycle);
    }, []);

    console.log("Current cycle is", cur_cycle);
    // Async function to fetch the metadata about the current parsed file
    const fetch_file_metada = async () => {
        const response = await fetch("/backend/file_metadata/", {
            method: "GET",
        });
        // Fail to get result
        if (!response.ok) {
            toast.error("Failed Fetching Metadata");
            return;
        }

        const fetched_metadata = await response.json();
        console.log("FETCHED META", fetched_metadata);
        setFileName(fetched_metadata["file_name"]);
        setNumPosClocks(fetched_metadata["num_pos_clocks"]);
        setNumNegClocks(fetched_metadata["num_neg_clocks"]);
    };

    // Fetch parsed information about this cycle
    const fetch_cycle_info = async () => {
        // Check if file_name is valid
        if (file_name !== "") {
            const pos_neg = include_neg ? "neg" : "pos"; // Check if we are including neg edges
            // Call a get REQUEST
            const response = await fetch(`/backend/${pos_neg}/${cur_cycle}`, {
                method: "GET",
            });

            if (!response.ok) {
                toast.error("FAILED Fetching Cycle info");
                return;
            }

            const data = await response.json();
            setCycleData(data.data);
            console.log("FETCHED CYCLE DATA: ", data.data);
        }
    };

    // Use effect to call fetch file metadata whenever rendering
    useEffect(() => {
        fetch_file_metada();
    }, []);

    // use effect to fetch cycle info whenever the include_neg or cur_cycle changes
    useEffect(() => {
        fetch_cycle_info();
    }, [include_neg, cur_cycle, file_name]);

    const extract_data = (cycle_data: any, module: string) => {
        return Object.fromEntries(
            Object.entries(cycle_data)
                .filter(([key, _]) => key.includes(module))
                .map(([key, val]) => {
                    const dotindex = key.indexOf(".");
                    const new_key =
                        dotindex >= 0 ? key.substring(dotindex + 1) : key;
                    return [new_key, val];
                })
        );
    };

    // Filter READY_LIST data to pass
    const ready_list_data = extract_data(cycle_data, "READY_LIST");
    const rob_data = extract_data(cycle_data, "ROB");
    const prf_data = extract_data(cycle_data, "REGFILE");
    const instruction_queue_data = extract_data(
        cycle_data,
        "INSTRUCTION_QUEUE"
    );

    return (
        <>
            <header>
                <DebuggerHeader
                    file_name={file_name}
                    cur_cycle={cur_cycle}
                    end_cycle_index={end_cycle_index}
                    include_neg={include_neg}
                    selected_number_sys={selected_number_sys}
                    negFlipHandler={negFlipHandler}
                    cycleHandler={cycleHandler}
                    numberSysHandler={numberSysHandler}
                />
                <ThemeToggle />
            </header>
            <main>
                <div className="ml-8 mr-8 flex flex-row flex-wrap">
                    <InstructionQueue
                        selected_number_sys={selected_number_sys}
                        instruction_queue_data={instruction_queue_data}
                    />
                    <ReorderBuffer rob_data={rob_data} />
                    <PRF_ReadyList
                        selected_number_sys={selected_number_sys}
                        ready_list_data={ready_list_data}
                        prf_data={prf_data}
                    />
                </div>
            </main>
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

export default DebuggerPage;
