"use client";

import DebuggerHeader from "@/components/DebuggerHeader";
import Decoder from "@/components/processor_components/Decoder";
import InstructionQueue from "@/components/processor_components/InstructionQueue";
import PRF_Ready_Free from "@/components/processor_components/PRF_Ready_Free";
import ReorderBuffer from "@/components/processor_components/ReorderBuffer";
import ReservationStation from "@/components/processor_components/ReservationStation";
import ThemeToggle from "@/components/ThemeToggle";
import { Instruction } from "@/lib/rvcodec.js/Instruction";
import { reverse_string } from "@/lib/utils";
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
                    const module_index = key.indexOf(module);
                    const new_key =
                        module_index >= 0 ? key.substring(module_index) : key;
                    return [new_key, val];
                })
        );
    };

    // Get all data for modules
    const ready_list_data = extract_data(cycle_data, "READY_LIST");
    const rob_data = extract_data(cycle_data, "ROB");
    const retire_list_data = extract_data(
        cycle_data,
        "RETIRE_LIST.retire_state_mask"
    );
    const prf_data = extract_data(cycle_data, "REGFILE");
    const instruction_queue_data = extract_data(
        cycle_data,
        "INSTRUCTION_QUEUE"
    );
    const reservation_station_data = extract_data(
        cycle_data,
        "RESERVATION_STATION"
    );

    const decoder_data = extract_data(cycle_data, "DECODER");

    const control_data = extract_data(cycle_data, "gen_control[0].CONTROL");
    const issue_data = extract_data(cycle_data, "ISSUE");
    const dispatch_data = extract_data(cycle_data, "DISPATCH");

    const free_list_data: any = extract_data(
        cycle_data,
        "FREE_LIST_BRAT_WORKER"
    );
    const current_free_list: string = reverse_string(
        free_list_data["FREE_LIST_BRAT_WORKER.current_state"]
    );

    const coordinator_data = extract_data(cycle_data, "COORDINATOR");
    console.log(coordinator_data);
  //  console.log(free_list_data["FREE_LIST_BRAT_WORKER.checkpoint_data[3]"][63-57])

    // Squash Data
    const squash_en = instruction_queue_data["INSTRUCTION_QUEUE.squash_en"];
    const is_squash = squash_en === "1";

    //  console.log(dispatch_data);
    // console.log(control_data);
    //  console.log(reservation_station_data);
    //   console.log(decoder_data);
    // console.log(issue_data);
    //  console.log(instruction_queue_data);
    // console.log(reservation_station_data);
    // console.log(rob_data);
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
                {/* Squash Info */}
                <div className="section small-section ml-8">
                    <h2 className="subsection-header">
                        Squash Enable:{" "}
                        <span
                            className={`font-bold ${
                                is_squash
                                    ? "text-[--color-primary]"
                                    : "text-[--color-accent]"
                            }`}
                        >
                            {is_squash ? "True" : "False"}
                        </span>
                    </h2>
                </div>
                <div className="ml-4 mr-4 flex flex-row flex-wrap">
                    <Decoder
                        selected_number_sys={selected_number_sys}
                        decoder_data={decoder_data}
                    />
                    <InstructionQueue
                        selected_number_sys={selected_number_sys}
                        instruction_queue_data={instruction_queue_data}
                    />
                    <ReorderBuffer
                        selected_number_sys={selected_number_sys}
                        rob_data={rob_data}
                        retire_list_data={retire_list_data}
                        is_squash={is_squash}
                    />
                    <ReservationStation
                        selected_number_sys={selected_number_sys}
                        reservation_station_data={reservation_station_data}
                        is_squash={is_squash}
                    />
                    <PRF_Ready_Free
                        selected_number_sys={selected_number_sys}
                        ready_list_data={ready_list_data}
                        prf_data={prf_data}
                        current_free_list={current_free_list}
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
