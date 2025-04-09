"use client";
import {
    convert_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
    parse_instruction,
    process_values,
    reverse_string,
} from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";
import { NumberSystem } from "@/app/debugger/page";
import React from "react";
let ROB_SIZE = 32;

const ReorderBuffer: React.FC<{
    selected_number_sys: NumberSystem;
    rob_data: any;
    retire_list_state_mask: string;
    branch_status: string;
}> = ({
    selected_number_sys,
    rob_data,
    retire_list_state_mask,
    branch_status,
}) => {
    const [show_subsection, setShowSubsection] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    if (rob_data["REORDER_BUFFER.SIZE"]) {
        ROB_SIZE = convert_hex_to_dec(rob_data["REORDER_BUFFER.SIZE"]);
    }

    // Get instructions, pc, destination tag and old tag, retirable
    const instructions: string[] = Array(ROB_SIZE).fill("");
    const pcs: string[] = Array(ROB_SIZE).fill("");
    const destination_tags: number[] = Array(ROB_SIZE).fill(0);
    const tag_olds: number[] = Array(ROB_SIZE).fill(0);
    let retirables: string = reverse_string(retire_list_state_mask);

    for (let i = 0; i < ROB_SIZE; i++) {
        const destination_tag =
            convert_hex_to_dec(
                rob_data[`REORDER_BUFFER.rob_data[${i}].destination_tag`]
            ) || 0;

        // Get the current PC based on NPC
        const pc = process_values(
            rob_data[`REORDER_BUFFER.rob_data[${i}].commit_packet.NPC`],
            selected_number_sys,
            true
        );
        const tag_old =
            convert_hex_to_dec(
                rob_data[`REORDER_BUFFER.rob_data[${i}].tag_old`]
            ) || 0;
        const instruction_hex_string =
            rob_data[`REORDER_BUFFER.rob_data[${i}].instruction`];
        const decoded_instruction = parse_instruction(instruction_hex_string);

        instructions[i] = decoded_instruction.asm;
        pcs[i] = pc;
        destination_tags[i] = destination_tag || 0;
        tag_olds[i] = tag_old || 0;
    }

    // Extract rob head and tail
    const rob_head = convert_hex_to_dec(rob_data["REORDER_BUFFER.head"]) || 0;
    const rob_tail = convert_hex_to_dec(rob_data["REORDER_BUFFER.tail"]) || 0;
    let rob_num_free = ROB_SIZE;
    if (rob_data["REORDER_BUFFER.num_free"]) {
        rob_num_free = convert_hex_to_dec(rob_data["REORDER_BUFFER.num_free"]);
    }

    // Extract rob squash_en and restore_tail
    let branch_tail: string | number = "-";
    if (rob_data["REORDER_BUFFER.branch_tail"]) {
        branch_tail = convert_hex_to_dec(
            rob_data["REORDER_BUFFER.branch_tail"]
        );
    }

    // Branch Info Opacity
    let branch_info_opacity = "opacity-15";
    if (branch_status === "1") {
        branch_info_opacity = "opacity-100";
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className={`section small-section ${branch_info_opacity}`}>
                <p className="smallsection-text w-[100%] flex flex-row">
                    Branch Tail:
                    <span className="font-bold ml-2 text-[--color-accent]">
                        {branch_tail}
                    </span>
                </p>
            </div>

            <div className="section sub-section">
                <h2 className="subsection-header">ROB</h2>
                <div className="flex flex-row gap-x-1">
                    {/* Table */}
                    <table className="rob-table">
                        <thead>
                            <tr>
                                <th>h/t</th>
                                <th>#</th>
                                <th>PC</th>
                                <th>Inst</th>
                                <th>T_dst</th>
                                <th>T_old</th>
                                <th>Retirable</th>
                            </tr>
                        </thead>

                        {/* Actual Register Values */}
                        <tbody>
                            {Array.from({ length: ROB_SIZE }, (_, i) => {
                                const entry_color = fifo_entry_color(
                                    i,
                                    rob_head,
                                    rob_tail,
                                    rob_num_free,
                                    ROB_SIZE
                                );
                                const head_tail = head_tail_comp(
                                    i,
                                    rob_head,
                                    rob_tail
                                );

                                let pc = "";
                                let inst = "";
                                let t_dst: string | number = "";
                                let t_old: string | number = "";
                                let is_ready_retire = "";
                                if (
                                    entry_color !== "" &&
                                    entry_color !== "red"
                                ) {
                                    pc = pcs[i];
                                    inst = instructions[i];
                                    t_dst = destination_tags[i];
                                    t_old = tag_olds[i];
                                    is_ready_retire =
                                        retirables[t_dst] == "1" ? "Y" : "N";
                                }
                                return (
                                    <tr key={i} className="blue">
                                        <td className={entry_color}>
                                            {head_tail}
                                        </td>
                                        <td className={entry_color}>{i}</td>
                                        <td className={entry_color}>{pc}</td>
                                        {/* If No color Or red(tail), then garbage vals */}
                                        <td className={entry_color}>{inst}</td>
                                        <td className={entry_color}>{t_dst}</td>
                                        <td className={entry_color}>{t_old}</td>
                                        <td className={entry_color}>
                                            {is_ready_retire}
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
                <h1 className="mainsection-header">Reorder Buffer</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default React.memo(ReorderBuffer);
