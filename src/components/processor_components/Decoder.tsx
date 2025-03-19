import { NumberSystem } from "@/app/debugger/page";
import {
    convert_hex_to_dec,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css"
const Decoder: React.FC<{
    selected_number_sys: NumberSystem;
    decoder_data: any;
}> = ({ selected_number_sys, decoder_data }) => {
    let DECODER_SIZE = 4; // Init to be 4
    if (decoder_data["DECODER.MAX_DECODE"]) {
        DECODER_SIZE = convert_hex_to_dec(decoder_data["DECODER.MAX_DECODE"]);
    }
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Get number of input instructions
    const num_legal_instructions =
        convert_hex_to_dec(decoder_data[`DECODER.num_legal_instructions`]) || 0;

    // Get instructions and pcs
    let instructions: string[] = Array(DECODER_SIZE).fill("");
    let pcs: string[] = Array(DECODER_SIZE).fill("");

    // Update info if we have decoder data
    if (decoder_data) {
        // If i is less than the num_instructions of input
        for (let i = 0; i < DECODER_SIZE && i < num_legal_instructions; i++) {
            const instruction_hex_string =
                decoder_data[`DECODER.instructions[${i}].inst`];

            // If instruction_hex_string exists and not all 0
            if (
                instruction_hex_string &&
                instruction_hex_string !== "00000000"
            ) {
                // Parse the instruction
                const decoded_instruction = parse_instruction(
                    instruction_hex_string
                );

                instructions[i] = decoded_instruction.asm;
            }

            const pc = process_values(
                decoder_data[`DECODER.pcs[${i}]`],
                selected_number_sys
            );
            // If pc is valid and instruction is also valid
            if (pc != "x" && instructions[i] != "") pcs[i] = pc;
        }
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className="section sub-section">
                <h2 className="subsection-header">Input</h2>

                <div className="flex flex-row gap-x-1">
                    {/* Table */}
                    <table className="decoder-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>PC</th>
                                <th>Inst</th>
                            </tr>
                        </thead>

                        {/* Input of Decoder */}
                        <tbody>
                            {Array.from({ length: DECODER_SIZE }, (_, i) => {
                                const entry_color =
                                    instructions[i] != "" ? "cyan" : "";
                                return (
                                    <tr key={i}>
                                        <td className={entry_color}>{i}</td>

                                        <td className={entry_color}>
                                            {pcs[i]}
                                        </td>
                                        <td className={entry_color}>
                                            {instructions[i]}
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
                <h1 className="mainsection-header">Decoder</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default Decoder;
