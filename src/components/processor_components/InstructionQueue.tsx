"use client";
import {
    convert_reg_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
    parse_instruction,
} from "@/lib/utils";
import { useState } from "react";
import { MouseEvent } from "react";
const InstructionQueue: React.FC<{ instruction_queue_data: any }> = ({
    instruction_queue_data,
}) => {
    const IQ_SIZE = 8;
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Get IQ head and tail, number free
    const iq_head = convert_reg_hex_to_dec(
        instruction_queue_data["INSTRUCTION_QUEUE.head"]
    );
    const iq_tail = convert_reg_hex_to_dec(
        instruction_queue_data["INSTRUCTION_QUEUE.tail"]
    );
    const iq_num_free = convert_reg_hex_to_dec(
        instruction_queue_data["INSTRUCTION_QUEUE.num_free"]
    );

    // Get PC, instructions and Branch_masks
    const instructions: string[] = Array(IQ_SIZE).fill("");
    const pcs: string[] = Array(IQ_SIZE).fill("");
    const branch_masks: string[] = Array(IQ_SIZE).fill("");

    // Update info if we have instruction_queue_data
    if (instruction_queue_data.length) {
        for (let i = 0; i < IQ_SIZE; i++) {
            const instruction_binary_string =
                instruction_queue_data[
                    `INSTRUCTION_QUEUE.iq_data[${i}].instruction`
                ];
            // Parse the instruction
            const decoded_instruction = parse_instruction(
                instruction_binary_string
            );
            instructions[i] = decoded_instruction.asm;

            const pc =
                instruction_queue_data[`INSTRUCTION_QUEUE.iq_data[${i}].pc`];
            const branch_mask =
                instruction_queue_data[
                    `INSTRUCTION_QUEUE.iq_data[${i}].branch_mask`
                ];

            pcs[i] = pc;
            branch_masks[i] = branch_mask;
        }
    }

    console.log(instruction_queue_data);
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
                            <th>B_Mask</th>
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
                                    <td className={entry_color}>
                                        {entry_color != "" &&
                                        entry_color != "red"
                                            ? branch_masks[i]
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
