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

let SQ_SIZE = 16;

const LoadStore: React.FC<{
    selected_number_sys: NumberSystem;
    store_queue_data: any;
    branch_status: string;
}> = ({ selected_number_sys, store_queue_data, branch_status }) => {
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
    const store_byte_masks: string[] = Array(SQ_SIZE).fill("");
    const store_retireds: string[] = Array(SQ_SIZE).fill("");
    const store_writtens: string[] = Array(SQ_SIZE).fill("");
    const store_head_tails: string[] = Array(SQ_SIZE).fill("");
    const store_entry_colors: string[] = Array(SQ_SIZE).fill("");
    // Extract SQ head and tail
    let store_head = 0;
    let store_tail = 0;
    let store_num_free = 0;
    let store_branch_tail = 0;

    if (store_queue_data["STORE_QUEUE.head"]) {
        store_head = convert_hex_to_dec(store_queue_data["STORE_QUEUE.head"]);
        store_tail = convert_hex_to_dec(store_queue_data["STORE_QUEUE.tail"]);
        store_num_free = convert_hex_to_dec(
            store_queue_data["STORE_QUEUE.num_free_entries"]
        );
        store_branch_tail = convert_hex_to_dec(
            store_queue_data["STORE_QUEUE.branch_tail"]
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

            // // Operation
            // const op = store_queue_data[`STORE_QUEUE.queue[${i}].op`];
            // if (op === "0") {
            //     store_ops[i] = "SB";
            // } else if (op === "1") {
            //     store_ops[i] = "SH";
            // } else {
            //     store_ops[i] = "SW";
            // }

            // Store Data
            store_memory_datas[i] = process_values(
                store_queue_data[`STORE_QUEUE.queue[${i}].store_queue_data`],
                selected_number_sys
            );

            // Byte Mask
            store_byte_masks[i] =
                store_queue_data[`STORE_QUEUE.queue[${i}].store_byte_mask`];

            // If Address is Ready
            const addr_ready: boolean =
                store_queue_data[`STORE_QUEUE.queue[${i}].addr_ready`] === "1";
            if (addr_ready) {
                store_addr_readys[i] = "Y";

                // Get actual address
                store_memory_addrs[i] = process_values(
                    store_queue_data[`STORE_QUEUE.queue[${i}].memory_addr`],
                    selected_number_sys
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

    const subsection_comp = show_subsection ? (
        <div>
            {/* Branch To Squash Info */}
            {/* {branch_status !== "0" ? (
                <div className="section small-section">
                    <p className="smallsection-text w-[100%] flex flex-row">
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
                </div>
            ) : null} */}

            {/* Store Queue */}
            <div className="section sub-section">
                {/* Branch Tail Info */}
                {branch_status === "1" ? (
                    <div className="section small-section">
                        <p className="smallsection-text w-[100%] flex flex-row">
                            Branch Tail:
                            <span className="font-bold ml-2 text-[--color-accent]">
                                {store_branch_tail}
                            </span>
                        </p>
                    </div>
                ) : null}
                <h2 className="subsection-header">Store Queue</h2>
                <div className="flex flex-row gap-x-1">
                    {/* SQ Table */}
                    <table className="sq-table">
                        <thead>
                            <tr>
                                <th>h/t</th>
                                <th>#</th>
                                <th>Inst</th>
                                <th>By_Mask</th>
                                <th>Data</th>
                                <th>Addr</th>
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
                                        <td className={store_entry_colors[i]}>
                                            {store_head_tails[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {i}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {store_instructions[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {store_byte_masks[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {store_memory_datas[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {store_memory_addrs[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {store_addr_readys[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {store_retireds[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
                                            {store_writtens[i]}
                                        </td>
                                        <td className={store_entry_colors[i]}>
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

export default LoadStore;
