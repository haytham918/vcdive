import { NumberSystem, ParsedData } from "@/app/debugger/page";
import {
    convert_hex_to_dec,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css";
const Fetch: React.FC<{
    selected_number_sys: NumberSystem;
    fetch_data: ParsedData;
}> = ({ selected_number_sys, fetch_data }) => {
    let FETCH_SIZE = 4; // Init to be 4
    if (fetch_data["FETCH.MAX_FETCH"]) {
        FETCH_SIZE = convert_hex_to_dec(fetch_data["FETCH.MAX_FETCH"]);
    }
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Get instructions and pcs
    const instructions: string[] = Array(FETCH_SIZE).fill("");
    const pcs: string[] = Array(FETCH_SIZE).fill("");
    const valids: string[] = Array(FETCH_SIZE).fill("");
    const entry_colors: string[] = Array(FETCH_SIZE).fill("");
    if (fetch_data["FETCH.MAX_FETCH"]) {
        for (let i = 0; i < FETCH_SIZE; i++) {
            valids[i] = fetch_data[`FETCH.internal_valid`][FETCH_SIZE - i - 1];
            if (valids[i] === "1") {
                entry_colors[i] = "cyan";
                pcs[i] = process_values(
                    fetch_data[`FETCH.pcs[${i}]`],
                    selected_number_sys
                );
                instructions[i] = parse_instruction(
                    fetch_data[`FETCH.instructions[${i}].inst`]
                ).asm;
            }
        }
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className="section sub-section">
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

                        {/* Input of Fetch */}
                        <tbody>
                            {Array.from({ length: FETCH_SIZE }, (_, i) => {
                                return (
                                    <tr key={i}>
                                        <td className={entry_colors[i]}>{i}</td>

                                        <td className={entry_colors[i]}>
                                            {pcs[i]}
                                        </td>
                                        <td className={entry_colors[i]}>
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
                <h1 className="mainsection-header">Fetch</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default Fetch;
