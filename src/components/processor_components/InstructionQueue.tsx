"use client";
import { NumberSystem } from "@/app/debugger/page";
import {
    convert_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import { useState } from "react";
import { MouseEvent } from "react";
const InstructionQueue: React.FC<{
    selected_number_sys: NumberSystem;
    instruction_queue_data: any;
}> = ({ selected_number_sys, instruction_queue_data }) => {
    const IQ_SIZE = 8;
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Squash
    const [show_squash, setShowSquash] = useState(true);
    const handleSquashClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSquash(!show_squash);
    };

    // Get IQ head and tail, number free
    const iq_head = convert_hex_to_dec(
        instruction_queue_data["INSTRUCTION_QUEUE.head"]
    );
    const iq_tail = convert_hex_to_dec(
        instruction_queue_data["INSTRUCTION_QUEUE.tail"]
    );
    const iq_num_free = convert_hex_to_dec(
        instruction_queue_data["INSTRUCTION_QUEUE.num_free"]
    );

    // Get instructions and pc
    const instructions: string[] = Array(IQ_SIZE).fill("");
    const pcs: string[] = Array(IQ_SIZE).fill("");

    // Update info if we have instruction_queue_data
    if (instruction_queue_data) {
        for (let i = 0; i < IQ_SIZE; i++) {
            const instruction_hex_string =
                instruction_queue_data[
                    `INSTRUCTION_QUEUE.iq_data[${i}].instruction`
                ];

            // Parse the instruction
            const decoded_instruction = parse_instruction(
                instruction_hex_string
            );
            instructions[i] = decoded_instruction.asm;

            const pc = process_values(
                instruction_queue_data[`INSTRUCTION_QUEUE.iq_data[${i}].pc`],
                selected_number_sys
            );

            pcs[i] = pc;
        }
    }

    const squash_en = instruction_queue_data["INSTRUCTION_QUEUE.squash_en"];
    const is_squash = squash_en === "1";

    const subsection_comp = show_subsection ? (
        <div className="section sub-section">
            <h2 className="subsection-header">IQ Data</h2>

            <div className="flex flex-row gap-x-1">
                {/* Table */}
                <table>
                    <thead>
                        <tr>
                            <th>h/t</th>
                            <th>#</th>
                            <th>PC</th>
                            <th>Inst</th>
                        </tr>
                    </thead>

                    {/* IQ Rows */}
                    <tbody>
                        {Array.from({ length: IQ_SIZE }, (_, i) => {
                            // Head Tail Info
                            const head_tail_val = head_tail_comp(
                                i,
                                iq_head,
                                iq_tail
                            );
                            const entry_color = fifo_entry_color(
                                i,
                                iq_head,
                                iq_tail,
                                iq_num_free,
                                IQ_SIZE
                            );
                            return (
                                <tr key={i}>
                                    <td className={entry_color}>
                                        {head_tail_val}
                                    </td>
                                    <td className={entry_color}>{i}</td>
                                    {/* If No color Or red(tail), then garbage vals */}
                                    <td className={entry_color}>
                                        {entry_color != "" &&
                                        entry_color != "red"
                                            ? pcs[i]
                                            : ""}
                                    </td>
                                    <td className={entry_color}>
                                        {entry_color != "" &&
                                        entry_color != "red"
                                            ? instructions[i]
                                            : ""}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">Instruction Queue</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default InstructionQueue;
