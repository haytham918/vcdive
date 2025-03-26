import { NumberSystem } from "@/app/debugger/page";
import {
    convert_hex_to_dec,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css";
const FileFetch: React.FC<{
    selected_number_sys: NumberSystem;
    file_fetch_data: any;
}> = ({ selected_number_sys, file_fetch_data }) => {
    let FETCH_SIZE = 4; // Init to be 4
    if (file_fetch_data["FILE_FETCH.MAX_FETCH"]) {
        FETCH_SIZE = convert_hex_to_dec(
            file_fetch_data["FILE_FETCH.MAX_FETCH"]
        );
    }
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Get instructions and pcs
    let instructions: string[] = Array(FETCH_SIZE).fill("");
    let pcs: string[] = Array(FETCH_SIZE).fill("");
    let new_pc_en: string = "0";
    let new_pc: string = "-";
    let new_pc_en_color: string = "";
    let new_pc_color: string = "opacity-10";
    let new_pc_text_color: string = "text-[--color-babyblue]"; // For the actual new_pc val

    // Update info if we have decoder data
    if (file_fetch_data) {
        // Get new_pc_en and new_pc
        new_pc_en = file_fetch_data["FILE_FETCH.new_pc_en"];
        // If it is new_pc_en, then we should get the actual new_pc
        if (new_pc_en === "1") {
            new_pc = process_values(
                file_fetch_data["FILE_FETCH.new_pc"],
                selected_number_sys
            );
            new_pc_en_color = "text-[--color-primary]";
            new_pc_color += "0"; // Add 0 to opacity to make it opacity-100
        }
        // If i is less than the num_instructions of input
        for (let i = 0; i < FETCH_SIZE; i++) {
            const instruction_hex_string =
                file_fetch_data[`FILE_FETCH.instructions[${i}].inst`];

            // If instruction_hex_string exists and not all 0 and not x
            if (
                instruction_hex_string &&
                instruction_hex_string !== "00000000" &&
                instruction_hex_string !== "x"
            ) {
                // Parse the instruction
                const decoded_instruction = parse_instruction(
                    instruction_hex_string
                );

                instructions[i] = decoded_instruction.asm;
            }

            const pc = process_values(
                file_fetch_data[`FILE_FETCH.pcs[${i}]`],
                selected_number_sys
            );
            // If pc is valid and instruction is also valid
            if (pc != "x" && instructions[i] != "") pcs[i] = pc;
        }
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className="section sub-section">
                {/* New PC Info */}
                <div className="inner-section font-bold partial-info-section w-[100%] mb-2">
                    <div className="flex">
                        New PC Enable:{" "}
                        <span className={`${new_pc_en_color} ml-auto`}>
                            {new_pc_en}
                        </span>
                    </div>
                    <div className={`flex ${new_pc_color}`}>
                        New PC:{" "}
                        <span className={`${new_pc_text_color} ml-auto`}>
                            {new_pc}
                        </span>
                    </div>
                </div>

                <h2 className="subsection-header">Fetched Inst</h2>

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

                        {/* Input of FileFetch */}
                        <tbody>
                            {Array.from({ length: FETCH_SIZE }, (_, i) => {
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
                <h1 className="mainsection-header">File Fetch</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default FileFetch;
