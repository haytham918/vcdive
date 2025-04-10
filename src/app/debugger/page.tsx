"use client";
import dynamic from "next/dynamic";
import DebuggerHeader from "@/components/DebuggerHeader";
import BranchGshare from "@/components/processor_components/BranchGshare";
import Brat from "@/components/processor_components/Brat";
import CoreMemBus from "@/components/processor_components/CoreMemBus";
import Dcache from "@/components/processor_components/Dcache";
import Decoder from "@/components/processor_components/Decoder";
import Icache from "@/components/processor_components/Icache";
import InstructionQueue from "@/components/processor_components/InstructionQueue";
import LoadStore from "@/components/processor_components/LoadStore";
import MapTable from "@/components/processor_components/MapTable";
import PRF_Ready_Free from "@/components/processor_components/PRF_Ready_Free";
import RAS from "@/components/processor_components/RAS";
import ReorderBuffer from "@/components/processor_components/ReorderBuffer";
import ReservationStation from "@/components/processor_components/ReservationStation";
import ThemeToggle from "@/components/ThemeToggle";
import { reverse_string } from "@/lib/utils";
import { useCallback, useEffect, useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
const Terminal = dynamic(
    () => import("@/components/processor_components/Terminal"),
    { ssr: false }
);
const TerminalDialog = dynamic(
    () => import("@/components/processor_components/TerminalDialog"),
    { ssr: false }
);
/*

    Page for the /debugger

*/
export type NumberSystem = "0d" | "0x"; // Maybe binary in the future

export type ParsedData = { string: string };

// Decide which to show and not to show for Terminal
export interface TerminalSettings {
    icache: { show: boolean; label: "I-Cache" };
    fetch: { show: boolean; label: "Fetch" };
    gshare: { show: boolean; label: "Gshare" };
    decoder: { show: boolean; label: "Decoder" };
    instruction_queue: { show: boolean; label: "Instruction Queue" };
    dispatch: { show: boolean; label: "Dispatch" };
    rob: { show: boolean; label: "Reorder Buffer" };
    rs: { show: boolean; label: "Reservation Station" };
    issue: { show: boolean; label: "Issue" };
    alu: { show: boolean; label: "ALU" };
    mult: { show: boolean; label: "MULT" };
    load: { show: boolean; label: "Load Unit" };
    store: { show: boolean; label: "Store Unit" };
    control: { show: boolean; label: "Control" };
    ras: { show: boolean; label: "RAS" };
    regfile: { show: boolean; label: "Regfile" };
    ready_list: { show: boolean; label: "Ready List" };
    retire_list: { show: boolean; label: "Retire List" };
    load_buffer: { show: boolean; label: "Load Buffer" };
    store_queue: { show: boolean; label: "Store Queue" };
    dcache: { show: boolean; label: "D-Cache" };
    coordinator: { show: boolean; label: "BRAT - Coordinator" };
    rob_tail: { show: boolean; label: "BRAT - ROB Tail" };
    brat_store_queue: { show: boolean; label: "BRAT - Store Queue" };
    brat_gshare: { show: boolean; label: "BRAT - Gshare" };
    brat_ras: { show: boolean; label: "BRAT - RAS" };
    map_table: { show: boolean; label: "BRAT - Map Table" };
    free_list: { show: boolean; label: "BRAT - Free List" };
}

// -------------- Extract Data --------------------------------------------------
const get_group_data = (cycle_data: any) => {
    const [group_data, setGroupData] = useState<Record<
        string,
        Array<[string, any]>
    > | null>(null);

    useEffect(() => {
        if (cycle_data && Object.keys(cycle_data).length > 0) {
            const worker = new Worker(
                new URL("/public/workers/CycleWorker.js", import.meta.url)
            );
            worker.postMessage(cycle_data);

            worker.onmessage = (event) => {
                setGroupData(event.data);
                worker.terminate();
            };
            return () => {
                worker.terminate();
            };
        }
    }, [cycle_data]);

    return group_data;
};

const get_module_data = (
    group_data: Record<string, Array<[string, any]>> | null,
    module: string
) => {
    return useMemo(() => {
        let base = module;
        if (
            module === "ALU" ||
            module === "MULT" ||
            module === "CONTROL" ||
            module === "LOAD_UNIT" ||
            module === "STORE_UNIT"
        ) {
            base = "gen";
        }
        const entries =
            group_data && group_data[module] ? group_data[module] : [];
        return Object.fromEntries(
            entries.map(([key, val]) => {
                const idx = key.indexOf(base);
                const new_key = idx >= 0 ? key.substring(idx) : key;
                return [new_key, val];
            })
        );
    }, [group_data, module]);
};

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

    // console.log("Current cycle is", cur_cycle);
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
        // console.log("FETCHED META", fetched_metadata);
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
            //  console.log("FETCHED CYCLE DATA: ", data.data);
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

    // const extract_data = (cycle_data: any, module: string) => {
    //     return Object.fromEntries(
    //         Object.entries(cycle_data)
    //             .filter(([key, _]) => key.includes(module))
    //             .map(([key, val]) => {
    //                 let start_str: string = module;
    //                 // If FU, then there are multiple
    //                 if (
    //                     module === "ALU" ||
    //                     module === "MULT" ||
    //                     module === "CONTROL"
    //                 ) {
    //                     start_str = "gen";
    //                 }
    //                 const start_index = key.indexOf(start_str);

    //                 const new_key =
    //                     start_index >= 0 ? key.substring(start_index) : key;
    //                 return [new_key, val];
    //             })
    //     );
    // };

    // Get all data for modules
    // Group Data: ------
    const group_data = get_group_data(cycle_data);
    const ready_list_data = get_module_data(group_data, "READY_LIST");
    const rob_data = get_module_data(group_data, "REORDER_BUFFER");

    const retire_list_data = get_module_data(group_data, "RETIRE_LIST");
    const retire_list_state_mask: any =
        retire_list_data["RETIRE_LIST.retire_state_mask"];

    const prf_data = get_module_data(group_data, "REGFILE");

    const instruction_queue_data = get_module_data(
        group_data,
        "INSTRUCTION_QUEUE"
    );
    const reservation_station_data = get_module_data(
        group_data,
        "RESERVATION_STATION"
    );

    const decoder_data = get_module_data(group_data, "DECODER");
    // const file_fetch_data = extract_data(group_data, "FILE_FETCH");

    // const control_data = extract_data(group_data, "gen_control[0].CONTROL");
    const issue_data = get_module_data(group_data, "ISSUE");

    const dispatch_data = get_module_data(group_data, "DISPATCH");

    const alu_data = get_module_data(group_data, "ALU");
    const control_data = get_module_data(group_data, "CONTROL");
    const mult_data = get_module_data(group_data, "MULT");

    const free_list_data: any = get_module_data(
        group_data,
        "FREE_LIST_BRAT_WORKER"
    );
    const current_free_list: string = useMemo(
        () =>
            reverse_string(
                free_list_data["FREE_LIST_BRAT_WORKER.current_state"]
            ),
        [free_list_data]
    );

    const coordinator_data: any = get_module_data(group_data, "COORDINATOR");
    const free_ids_mask = coordinator_data["COORDINATOR.free_ids_mask"];

    const map_table_data = get_module_data(group_data, "MAP_TABLE_BRAT_WORKER");
    const rob_tail_data = get_module_data(group_data, "ROB_TAIL_BRAT_WORKER");
    const sq_tail_data = get_module_data(group_data, "SQ_TAIL_BRAT_WORKER");
    //  console.log(free_list_data["FREE_LIST_BRAT_WORKER.checkpoint_data[3]"][63-57])

    // Load + Store
    const load_buffer_data = get_module_data(group_data, "LOAD_BUFFER");
    const store_queue_data = get_module_data(group_data, "STORE_QUEUE");

    const load_unit_data = get_module_data(group_data, "LOAD_UNIT");
    const store_unit_data = get_module_data(group_data, "STORE_UNIT");

    // gshare
    const gshare_data: any = get_module_data(group_data, "GSHARE");

    const gshare_gbhr: any = gshare_data["GSHARE.global_history"];
    const gbhr_checkpoint_data: any = get_module_data(
        group_data,
        "GBHR_BRAT_WORKER"
    );

    // Squash Data
    const branch_status: any =
        reservation_station_data["RESERVATION_STATION.branch_status"];

    // Handle Terminal Dialog -------------------------------------------
    const [show_dialog, setShowDialog] = useState(false);
    const handleOpenDialog = () => {
        const main_element = document.querySelector("main");
        if (main_element) {
            main_element.classList.add("opacity-20");
        }
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        const main_element = document.querySelector("main");
        if (main_element) {
            main_element.classList.remove("opacity-20");
        }
        setShowDialog(false);
    };

    // Icache
    const icache_data = get_module_data(group_data, "ICACHE");

    // Dcache
    const dcache_data = get_module_data(group_data, "DCACHE");

    // Fetch
    const fetch_data = get_module_data(group_data, "FETCH");

    // RAS
    const ras_data = get_module_data(group_data, "RETURN_ADDRESS_STACK");
    const ras_checkpoint_data: any = get_module_data(
        group_data,
        "RAS_BRAT_WORKER"
    );

    // CPU Memory Bus output
    const mem_bus_address_data = get_module_data(
        group_data,
        "CORE.mem_bus_address"
    );
    const mem_bus_command_data = get_module_data(
        group_data,
        "CORE.mem_bus_command"
    );
    const mem_bus_data_out_data = get_module_data(
        group_data,
        "CORE.mem_bus_data_out"
    );

    // CPU Memory Bus input
    const mem_bus_req_tag_in_data = get_module_data(
        group_data,
        "CORE.mem_bus_req_tag_in"
    );
    const mem_bus_complete_tag_in_data = get_module_data(
        group_data,
        "CORE.mem_bus_complete_tag_in"
    );
    const mem_bus_data_in_data = get_module_data(
        group_data,
        "CORE.mem_bus_data_in"
    );

    const instr_count_data = get_module_data(group_data, "instr_count");

    const real_cycle_data = get_module_data(group_data, "clock_cycle");

    const [terminal_settings, setTerminalSettings] = useState<TerminalSettings>(
        {
            icache: {
                show: false,
                label: "I-Cache",
            },
            fetch: {
                show: false,
                label: "Fetch",
            },
            gshare: { show: false, label: "Gshare" },
            decoder: { show: false, label: "Decoder" },
            instruction_queue: {
                show: false,
                label: "Instruction Queue",
            },
            dispatch: { show: false, label: "Dispatch" },
            rob: { show: false, label: "Reorder Buffer" },
            rs: {
                show: false,
                label: "Reservation Station",
            },
            issue: { show: false, label: "Issue" },
            alu: { show: false, label: "ALU" },
            mult: { show: false, label: "MULT" },
            load: { show: false, label: "Load Unit" },
            store: { show: false, label: "Store Unit" },
            control: { show: false, label: "Control" },
            ras: { show: false, label: "RAS" },
            regfile: { show: false, label: "Regfile" },
            ready_list: { show: false, label: "Ready List" },
            coordinator: { show: false, label: "BRAT - Coordinator" },
            map_table: { show: false, label: "BRAT - Map Table" },
            free_list: { show: false, label: "BRAT - Free List" },
            rob_tail: { show: false, label: "BRAT - ROB Tail" },
            retire_list: { show: false, label: "Retire List" },
            brat_gshare: { show: false, label: "BRAT - Gshare" },
            brat_ras: { show: false, label: "BRAT - RAS" },
            load_buffer: { show: false, label: "Load Buffer" },
            store_queue: { show: false, label: "Store Queue" },
            brat_store_queue: { show: false, label: "BRAT - Store Queue" },
            dcache: { show: false, label: "D-Cache" },
        }
    );

    // console.log("LOAD BUFFER: ", JSON.stringify(load_buffer_data).length);
    // console.log("Store Queue", JSON.stringify(store_queue_data).length);
    // console.log("ICACHE: ", JSON.stringify(icache_data).length);
    // console.log("DCACHE: ", JSON.stringify(dcache_data).length);
    // console.log("Issue: ", JSON.stringify(issue_data).length);
    // console.log("ALU: ", JSON.stringify(alu_data).length);
    // console.log("MUlt: ", JSON.stringify(mult_data).length);
    // console.log("CU: ", JSON.stringify(control_data).length);
    // console.log("ROB: ", JSON.stringify(rob_data).length);
    // console.log("RS: ", JSON.stringify(reservation_station_data).length);
    // console.log("regfile: ", JSON.stringify(prf_data).length);

    const handleTerminalSettings = useCallback(
        (module: string, set_value: boolean) => {
            setTerminalSettings((prevSettings: any) => ({
                ...prevSettings,
                [module]: {
                    ...prevSettings[module],
                    show: set_value,
                },
            }));
        },
        []
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
                    instr_count_data={instr_count_data}
                    real_cycle_data={real_cycle_data}
                    negFlipHandler={negFlipHandler}
                    cycleHandler={cycleHandler}
                    numberSysHandler={numberSysHandler}
                />
                <ThemeToggle />
            </header>
            <main>
                <div className="ml-4 mr-4 flex flex-row flex-wrap">
                    <Icache
                        select_number_sys={selected_number_sys}
                        icache_data={icache_data}
                    />

                    {/* Group Here */}
                    <div>
                        {/* Group Here */}
                        <div className="flex">
                            {/* Group Here */}
                            <div>
                                <Decoder
                                    selected_number_sys={selected_number_sys}
                                    decoder_data={decoder_data}
                                />
                                <BranchGshare
                                    branch_status={branch_status}
                                    gshare_gbhr={gshare_gbhr}
                                    control_data={control_data}
                                />
                            </div>

                            <InstructionQueue
                                selected_number_sys={selected_number_sys}
                                instruction_queue_data={instruction_queue_data}
                            />
                        </div>
                        <CoreMemBus
                            mem_bus_address_data={mem_bus_address_data}
                            mem_bus_command_data={mem_bus_command_data}
                            mem_bus_complete_tag_in_data={
                                mem_bus_complete_tag_in_data
                            }
                            mem_bus_data_out_data={mem_bus_data_out_data}
                            mem_bus_data_in_data={mem_bus_data_in_data}
                            mem_bus_req_tag_in_data={mem_bus_req_tag_in_data}
                            select_number_sys={selected_number_sys}
                        />
                        <MapTable map_table_data={map_table_data} />
                    </div>
                    <ReorderBuffer
                        selected_number_sys={selected_number_sys}
                        rob_data={rob_data}
                        retire_list_state_mask={retire_list_state_mask}
                        branch_status={branch_status}
                    />

                    <div className="flex flex-col">
                        <ReservationStation
                            selected_number_sys={selected_number_sys}
                            reservation_station_data={reservation_station_data}
                            branch_status={branch_status}
                        />
                        <RAS
                            ras_data={ras_data}
                            selected_number_sys={selected_number_sys}
                            branch_status={branch_status}
                        />
                    </div>
                    <PRF_Ready_Free
                        selected_number_sys={selected_number_sys}
                        ready_list_data={ready_list_data}
                        prf_data={prf_data}
                        current_free_list={current_free_list}
                    />
                    <LoadStore
                        selected_number_sys={selected_number_sys}
                        store_queue_data={store_queue_data}
                        load_buffer_data={load_buffer_data}
                        branch_status={branch_status}
                    />
                    <Dcache
                        dcache_data={dcache_data}
                        select_number_sys={selected_number_sys}
                    />
                    <Brat
                        free_ids_mask={free_ids_mask}
                        free_list_data={free_list_data}
                        rob_tail_data={rob_tail_data}
                        map_table_data={map_table_data}
                        gbhr_checkpoint_data={gbhr_checkpoint_data}
                        ras_checkpoint_data={ras_checkpoint_data}
                        sq_tail_data={sq_tail_data}
                    />
                </div>
                <Terminal
                    icache_data={icache_data}
                    fetch_data={fetch_data}
                    decoder_data={decoder_data}
                    instruction_queue_data={instruction_queue_data}
                    reservation_station_data={reservation_station_data}
                    rob_data={rob_data}
                    issue_data={issue_data}
                    dispatch_data={dispatch_data}
                    alu_data={alu_data}
                    mult_data={mult_data}
                    control_data={control_data}
                    ready_list_data={ready_list_data}
                    coordinator_data={coordinator_data}
                    prf_data={prf_data}
                    free_list_data={free_list_data}
                    map_table_data={map_table_data}
                    rob_tail_data={rob_tail_data}
                    retire_list_data={retire_list_data}
                    gshare_data={gshare_data}
                    gbhr_checkpoint_data={gbhr_checkpoint_data}
                    store_queue_data={store_queue_data}
                    load_buffer_data={load_buffer_data}
                    sq_tail_data={sq_tail_data}
                    dcache_data={dcache_data}
                    load_unit_data={load_unit_data}
                    store_unit_data={store_unit_data}
                    ras_checkpoint_data={ras_checkpoint_data}
                    ras_data={ras_data}
                    terminal_settings={terminal_settings}
                    handleOpenDialog={handleOpenDialog}
                />
            </main>
            <TerminalDialog
                show_dialog={show_dialog}
                handleCloseDialog={handleCloseDialog}
                terminal_settings={terminal_settings}
                handleTerminalSettings={handleTerminalSettings}
            />
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
