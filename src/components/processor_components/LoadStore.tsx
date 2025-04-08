"use client";
import {
    convert_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";
import { NumberSystem } from "@/app/debugger/page";
import React from "react";
let SQ_SIZE = 16;
let LB_SIZE = 16;

const LoadStore: React.FC<{
    selected_number_sys: NumberSystem;
    store_queue_data: any;
    load_buffer_data: any;
    branch_status: string;
}> = ({
    selected_number_sys,
    store_queue_data,
    load_buffer_data,
    branch_status,
}) => {
    // Display Info
    const [show_subsection, setShowSubsection] = useState(true);
    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Store Queue Data
    if (store_queue_data["STORE_QUEUE.SIZE"]) {
        SQ_SIZE = convert_hex_to_dec(store_queue_data["STORE_QUEUE.SIZE"]);
    }
    const store_instructions: string[] = Array(SQ_SIZE).fill("");
    // const store_ops: string[] = Array(SQ_SIZE).fill("");
    const store_memory_datas: string[] = Array(SQ_SIZE).fill("");
    const store_memory_addrs: string[] = Array(SQ_SIZE).fill("");
    const store_banks: (string | number)[] = Array(SQ_SIZE).fill("");
    const store_addr_readys: string[] = Array(SQ_SIZE).fill("");
    const store_retireds: string[] = Array(SQ_SIZE).fill("");
    const store_writtens: string[] = Array(SQ_SIZE).fill("");
    const store_head_tails: string[] = Array(SQ_SIZE).fill("");
    const store_entry_colors: string[] = Array(SQ_SIZE).fill("");
    // Extract SQ head and tail
    let store_head = 0;
    let store_tail = 0;
    let store_num_free = 0;
    let store_branch_tail = 0;

    if (store_queue_data["STORE_QUEUE.current_head.pointer"]) {
        store_head = convert_hex_to_dec(
            store_queue_data["STORE_QUEUE.current_head.pointer"]
        );
        store_tail = convert_hex_to_dec(
            store_queue_data["STORE_QUEUE.current_tail.pointer"]
        );
        store_num_free = convert_hex_to_dec(
            store_queue_data["STORE_QUEUE.num_free_entries"]
        );
        store_branch_tail = convert_hex_to_dec(
            store_queue_data["STORE_QUEUE.branch_tail.pointer"]
        );
        for (let i = 0; i < SQ_SIZE; i++) {
            store_entry_colors[i] = fifo_entry_color(
                i,
                store_head,
                store_tail,
                store_num_free,
                SQ_SIZE
            );

            store_head_tails[i] = head_tail_comp(i, store_head, store_tail);
            if (store_entry_colors[i] === "" || store_entry_colors[i] === "red")
                continue;

            store_instructions[i] = parse_instruction(
                store_queue_data[`STORE_QUEUE.queue[${i}].instruction`]
            ).asm;

            // Store Data
            store_memory_datas[i] = process_values(
                store_queue_data[`STORE_QUEUE.queue[${i}].data`],
                selected_number_sys
            );

            // If Address is Ready
            const addr_ready: boolean =
                store_queue_data[`STORE_QUEUE.queue[${i}].addr_ready`] === "1";
            if (addr_ready) {
                store_addr_readys[i] = "Y";

                // Get actual address
                store_memory_addrs[i] = process_values(
                    store_queue_data[`STORE_QUEUE.queue[${i}].addr`],
                    selected_number_sys,
                    false,
                    false
                );

                // Get bank
                let binary_address;
                if (selected_number_sys === "0x") {
                    binary_address = parseInt(store_memory_addrs[i], 16);
                } else {
                    binary_address = parseInt(store_memory_addrs[i], 10);
                }
                const bank = (binary_address >> 3) & 0b1;
                store_banks[i] = bank;

                // Get retired
                const retired: boolean =
                    store_queue_data[`STORE_QUEUE.queue[${i}].retired`] === "1";
                if (retired) {
                    store_retireds[i] = "Y";

                    // Get written
                    store_writtens[i] =
                        store_queue_data[`STORE_QUEUE.queue[${i}].written`] ===
                        "1"
                            ? "Y"
                            : "N";
                } else {
                    store_retireds[i] = "N";
                    store_writtens[i] = "-";
                }
            } else {
                store_addr_readys[i] = "N";
                store_memory_addrs[i] = "-";
                store_retireds[i] = "-";
                store_writtens[i] = "-";
            }
        }
    }

    // Load Buffer Data
    if (load_buffer_data["LOAD_BUFFER.SIZE"]) {
        LB_SIZE = convert_hex_to_dec(load_buffer_data["LOAD_BUFFER.SIZE"]);
    }
    const load_instructions: string[] = Array(LB_SIZE).fill("");
    const load_branch_masks: string[] = Array(LB_SIZE).fill("");
    const load_destination_tags: (string | number)[] = Array(LB_SIZE).fill("");
    const load_corresponding_store_tails: (string | number)[] =
        Array(LB_SIZE).fill("");
    const load_parities: string[] = Array(LB_SIZE).fill("");
    const load_memory_addrs: string[] = Array(LB_SIZE).fill("");
    const load_states: string[] = Array(LB_SIZE).fill("");
    const load_has_requested_cache: string[] = Array(LB_SIZE).fill("");
    const load_has_granted_cache: string[] = Array(LB_SIZE).fill("");
    const load_datas: string[] = Array(LB_SIZE).fill("");
    const load_entry_colors: string[] = Array(LB_SIZE).fill("");
    const resolved_branch_id: string =
        load_buffer_data["LOAD_BUFFER.resolved_branch_id"] || "-";
    const load_banks: (string | number)[] = Array(LB_SIZE).fill("");

    if (load_buffer_data["LOAD_BUFFER.SIZE"]) {
        // Get each entry information
        for (let i = 0; i < LB_SIZE; i++) {
            // Get state
            const entry_state =
                load_buffer_data[
                    `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.state`
                ];
            // If entry state is 0 (No Load), then it's empty
            if (entry_state === "0") continue;

            // Set states
            if (entry_state === "1") {
                load_states[i] = "WAIT_FU";
            } else if (entry_state === "2") {
                load_states[i] = "WAIT_VAL";
            } else {
                load_states[i] = "REQ_OUT";
            }

            // Set color
            load_entry_colors[i] = "cyan";

            // Set instructions
            load_instructions[i] = parse_instruction(
                load_buffer_data[
                    `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.load_entry.instruction`
                ]
            ).asm;

            // Set branch_mask
            load_branch_masks[i] =
                load_buffer_data[
                    `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.load_entry.branch_mask`
                ];

            // Set destination_tag
            load_destination_tags[i] = convert_hex_to_dec(
                load_buffer_data[
                    `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.load_entry.destination_tag`
                ]
            );

            // Set store tail
            load_corresponding_store_tails[i] = convert_hex_to_dec(
                load_buffer_data[
                    `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.load_entry.corresponding_store_tail.pointer`
                ]
            );
            // Set store tail parity
            load_parities[i] =
                load_buffer_data[
                    `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.load_entry.corresponding_store_tail.parity`
                ];

            // Set memory_addr if not waiting for FU
            // Set has_requested_cache
            // Set has_granted_cache
            if (entry_state !== "1") {
                load_memory_addrs[i] = process_values(
                    load_buffer_data[
                        `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.addr`
                    ],
                    selected_number_sys,
                    false,
                    false
                );

                // Get bank
                let binary_address;
                if (selected_number_sys === "0x") {
                    binary_address = parseInt(store_memory_addrs[i], 16);
                } else {
                    binary_address = parseInt(store_memory_addrs[i], 10);
                }
                const bank = (binary_address >> 3) & 0b1;
                load_banks[i] = bank;

                // Set has requested cache and if cache is granted if waitng for VAL
                if (entry_state === "2") {
                    load_has_requested_cache[i] =
                        load_buffer_data[
                            `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.has_requested_cache`
                        ] === "1"
                            ? "Y"
                            : "N";

                    if (load_has_requested_cache[i] === "Y") {
                        load_has_granted_cache[i] =
                            load_buffer_data[
                                `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.cache_req_gnt`
                            ] === "1"
                                ? "Y"
                                : "N";
                    } else {
                        load_has_granted_cache[i] = "-";
                    }
                } else {
                    // Not in state 2, we are either before requesting or had all
                    load_has_requested_cache[i] = "-";
                    load_has_granted_cache[i] = "-";
                }

                // If requesting output, set data
                if (entry_state === "3") {
                    load_datas[i] = process_values(
                        load_buffer_data[
                            `LOAD_BUFFER.gen_load_handler[${i}].LOAD_HANDLER.output_data`
                        ],
                        selected_number_sys
                    );
                } else {
                    load_datas[i] = "-";
                }
            } else {
                load_memory_addrs[i] = "-";
                load_has_requested_cache[i] = "-";
                load_has_granted_cache[i] = "-";
                load_datas[i] = "-";
            }
        }
    }

    // branch info opacity
    let resolved_branch_opacity = "opacity-15";
    let store_branch_tail_opacity = "opacity-15";
    if (branch_status !== "0") {
        resolved_branch_opacity = "opacity-100";
        if (branch_status === "1") {
            store_branch_tail_opacity = "opacity-100";
        }
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className="section small-section">
                <p
                    className={`smallsection-text w-[100%] flex flex-row ${resolved_branch_opacity}`}
                >
                    Resolved Branch:
                    <span
                        className={`font-bold ml-2 ${
                            branch_status === "1"
                                ? `text-[--color-accent]`
                                : `text-[--color-primary]`
                        }`}
                    >
                        {resolved_branch_id}
                    </span>
                </p>

                {/* Display SQ branch tail if mispredicted */}
                <p
                    className={`smallsection-text w-[100%] flex flex-row ${store_branch_tail_opacity}
                    mt-1`}
                >
                    SQ Branch Tail:
                    <span className="font-bold ml-2 text-[--color-accent]">
                        {store_branch_tail}
                    </span>
                </p>
            </div>

            {/* Load Buffer and Store Queue */}
            <div className="flex gap-x-4">
                {/* Load Buffer */}
                <div className="section sub-section">
                    <h2 className="subsection-header">Load Buffer</h2>
                    <div className="flex flex-row gap-x-1">
                        {/* LB Table */}
                        <table className="lb-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Inst</th>
                                    <th>T_dst</th>
                                    <th>SQ_Tail</th>
                                    <th>Parity</th>
                                    <th>B_MASK</th>
                                    <th>State</th>
                                    <th>Base_Addr</th>
                                    <th>Req_$?</th>
                                    <th>Gnt_$?</th>
                                    <th>Data</th>
                                    <th>Bank</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Array.from({ length: LB_SIZE }, (_, i) => {
                                    return (
                                        <tr key={i}>
                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {i}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_instructions[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_destination_tags[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {
                                                    load_corresponding_store_tails[
                                                        i
                                                    ]
                                                }
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_parities[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_branch_masks[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_states[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_memory_addrs[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_has_requested_cache[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_has_granted_cache[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_datas[i]}
                                            </td>

                                            <td
                                                className={load_entry_colors[i]}
                                            >
                                                {load_banks[i]}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Store Queue */}
                <div className="section sub-section">
                    <h2 className="subsection-header">Store Queue</h2>
                    <div className="flex flex-row gap-x-1">
                        {/* SQ Table */}
                        <table className="sq-table">
                            <thead>
                                <tr>
                                    <th>h/t</th>
                                    <th>#</th>
                                    <th>Inst</th>
                                    <th>Data</th>
                                    <th>Base_Addr</th>
                                    <th>A_Ready</th>
                                    <th>Retired</th>
                                    <th>Written</th>
                                    <th>Bank</th>
                                </tr>
                            </thead>

                            <tbody>
                                {Array.from({ length: SQ_SIZE }, (_, i) => {
                                    return (
                                        <tr key={i}>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_head_tails[i]}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {i}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_instructions[i]}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_memory_datas[i]}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_memory_addrs[i]}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_addr_readys[i]}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_retireds[i]}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_writtens[i]}
                                            </td>
                                            <td
                                                className={
                                                    store_entry_colors[i]
                                                }
                                            >
                                                {store_banks[i]}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">Load & Store</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default React.memo(LoadStore);
