import { NumberSystem, ParsedData } from "@/app/debugger/page";
import {
    convert_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import { useState } from "react";
import { MouseEvent } from "react";
import React from "react";
let IQ_SIZE = 8;
const InstructionQueue: React.FC<{
    selected_number_sys: NumberSystem;
    instruction_queue_data: ParsedData;
}> = ({ selected_number_sys, instruction_queue_data }) => {
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    if (instruction_queue_data["INSTRUCTION_QUEUE.SIZE"]) {
        IQ_SIZE = convert_hex_to_dec(
            instruction_queue_data["INSTRUCTION_QUEUE.SIZE"]
        );
    }

    // Get IQ head and tail, number free
    const iq_head =
        convert_hex_to_dec(instruction_queue_data["INSTRUCTION_QUEUE.head"]) ||
        0;
    const iq_tail =
        convert_hex_to_dec(instruction_queue_data["INSTRUCTION_QUEUE.tail"]) ||
        0;
    let iq_num_free = IQ_SIZE;
    if (instruction_queue_data["INSTRUCTION_QUEUE.num_free"]) {
        iq_num_free = convert_hex_to_dec(
            instruction_queue_data["INSTRUCTION_QUEUE.num_free"]
        );
    }

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

    const subsection_comp = show_subsection ? (
        <div className="section sub-section">
            <h2 className="subsection-header">IQ Data</h2>

            <div className="flex flex-row gap-x-1">
                {/* Table */}
                <table className="iq-table">
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

export default React.memo(InstructionQueue);
