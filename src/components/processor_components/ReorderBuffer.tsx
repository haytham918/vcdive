"use client";
import {
    convert_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
    parse_instruction,
} from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";

const ROB_SIZE = 32;

const ReorderBuffer: React.FC<{ rob_data: any }> = ({ rob_data }) => {
    const [show_subsection, setShowSubsection] = useState(true);
    const [show_squash, setShowSquash] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Open / Close Squash info
    const handleSquashClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSquash(!show_squash);
    };

    // Get instructions, destination tag and old tag
    const instructions: string[] = Array(ROB_SIZE).fill("");
    const destination_tags: number[] = Array(ROB_SIZE).fill(0);
    const tag_olds: number[] = Array(ROB_SIZE).fill(0);
    for (let i = 0; i < ROB_SIZE; i++) {
        const destination_tag = convert_hex_to_dec(
            rob_data[`ROB.rob_data[${i}].destination_tag`]
        );
        const tag_old = convert_hex_to_dec(
            rob_data[`ROB.rob_data[${i}].tag_old`]
        );
        const instruction_hex_string =
            rob_data[`ROB.rob_data[${i}].instruction`];
        const decoded_instruction = parse_instruction(instruction_hex_string);

        instructions[i] = decoded_instruction.asm;
        destination_tags[i] = destination_tag || 0;
        tag_olds[i] = tag_old || 0;
    }

    // Extract rob head and tail
    const rob_head = convert_hex_to_dec(rob_data["ROB.head"]);
    const rob_tail = convert_hex_to_dec(rob_data["ROB.tail"]);
    const rob_num_free = convert_hex_to_dec(rob_data["ROB.num_free"]);

    // Extract rob squash_en and restore_tail
    const squash_en = rob_data["ROB.squash_en"];
    const is_squash = squash_en === "1";
    const branch_tail = convert_hex_to_dec(rob_data["ROB.branch_tail"]);

    const subsection_comp = show_subsection ? (
        <div>
            {/* Squash Info */}
            <div className="section small-section">
                <a onClick={handleSquashClick}>
                    <h3 className="smallsection-header">Squash</h3>
                </a>
                {show_squash ? (
                    <>
                        <p className="smallsection-text">
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
                        </p>

                        {is_squash ? (
                            <p className="smallsection-text w-[100%] flex flex-row">
                                Branch Tail -&gt;
                                <span className="font-bold ml-auto text-[--color-accent]">
                                    {branch_tail}
                                </span>
                            </p>
                        ) : null}
                    </>
                ) : null}
            </div>

            <div className="section sub-section">
                <h2 className="subsection-header">ROB</h2>
                <div className="flex flex-row gap-x-1">
                    {/* Table */}
                    <table>
                        <thead>
                            <tr>
                                <th>h/t</th>
                                <th>#</th>
                                <th>Inst</th>
                                <th>T_dst</th>
                                <th>T_old</th>
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
                                return (
                                    <tr key={i} className="blue">
                                        <td className={entry_color}>
                                            {head_tail}
                                        </td>
                                        <td className={entry_color}>{i}</td>
                                        {/* If No color Or red(tail), then garbage vals */}
                                        <td className={entry_color}>
                                            {entry_color != "" &&
                                            entry_color != "red"
                                                ? instructions[i]
                                                : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {entry_color != "" &&
                                            entry_color != "red"
                                                ? destination_tags[i]
                                                : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {entry_color != "" &&
                                            entry_color != "red"
                                                ? tag_olds[i]
                                                : ""}
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

export default ReorderBuffer;
