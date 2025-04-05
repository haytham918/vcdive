"use client";
import {
    convert_hex_to_dec,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";
import { NumberSystem } from "@/app/debugger/page";

let RS_SIZE = 16;

// Entry color
const rs_entry_color = (is_valid: boolean) => {
    return is_valid ? "cyan" : "";
};

const ReservationStation: React.FC<{
    selected_number_sys: NumberSystem;
    reservation_station_data: any;
    branch_status: string;
}> = ({ selected_number_sys, reservation_station_data, branch_status }) => {
    const [show_subsection, setShowSubsection] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    if (reservation_station_data["RESERVATION_STATION.SIZE"]) {
        RS_SIZE = convert_hex_to_dec(
            reservation_station_data["RESERVATION_STATION.SIZE"]
        );
    }

    // Get RS info
    const valids: boolean[] = Array(RS_SIZE).fill(false);
    const instructions: string[] = Array(RS_SIZE).fill("");

    const destination_tags: (string | number)[] = Array(RS_SIZE).fill("-");
    const t1s: (string | number)[] = Array(RS_SIZE).fill("-");
    const t2s: (string | number)[] = Array(RS_SIZE).fill("-");
    const immediates: (string | number)[] = Array(RS_SIZE).fill("-");
    const pcs: string[] = Array(RS_SIZE).fill("-");
    const branch_ids: string[] = Array(RS_SIZE).fill("-");
    const branch_masks: string[] = Array(RS_SIZE).fill("-");
    for (let i = 0; i < RS_SIZE; i++) {
        // Check if this row is valid
        const is_valid =
            reservation_station_data[
                `RESERVATION_STATION.rs_table[${i}].valid`
            ];
        valids[i] = is_valid === "1";
        // If not valid, no need to retrieve further info
        if (valids[i] == false) continue;

        // Get Instruction
        const instruction_hex_string =
            reservation_station_data[
                `RESERVATION_STATION.rs_table[${i}].instruction`
            ];

        // Check if it's all zero, if so skip
        if (instruction_hex_string === "00000000") {
            continue;
        }

        // Decoded Instruction
        const decoded_instruction = parse_instruction(instruction_hex_string);
        const instruction_type = decoded_instruction.fmt;
        instructions[i] = decoded_instruction.asm;

        // Check if instruction is Store or Branch (no jump), if so, destination_tag is not useful
        if (instruction_type != "S-type" && instruction_type != "B-type") {
            const destination_tag = convert_hex_to_dec(
                reservation_station_data[
                    `RESERVATION_STATION.rs_table[${i}].destination_tag`
                ]
            );
            destination_tags[i] = destination_tag;
        }

        // instruction is not U, J, then t1 is valid
        if (instruction_type != "U-type" && instruction_type != "J-type") {
            const t1 = convert_hex_to_dec(
                reservation_station_data[
                    `RESERVATION_STATION.rs_table[${i}].t1`
                ]
            );
            t1s[i] = t1;
        }

        // If instruction is not I, U, J, then t2 is valid
        if (
            instruction_type != "I-type" &&
            instruction_type != "U-type" &&
            instruction_type != "J-type"
        ) {
            const t2 = convert_hex_to_dec(
                reservation_station_data[
                    `RESERVATION_STATION.rs_table[${i}].t2`
                ]
            );
            t2s[i] = t2;
        }

        // Check if it's not r-type, if not then need immediate
        if (instruction_type != "R-type") {
            const immediate = process_values(
                reservation_station_data[
                    `RESERVATION_STATION.rs_table[${i}].imm`
                ],
                selected_number_sys
            );
            immediates[i] = immediate;
        }

        // Get pc and branch_mask
        const pc = process_values(
            reservation_station_data[`RESERVATION_STATION.rs_table[${i}].pc`],
            selected_number_sys
        );
        pcs[i] = pc;

        // Get Dest Fu
        const dest_fu =
            reservation_station_data[
                `RESERVATION_STATION.rs_table[${i}].dest_fu`
            ];
        // If dest_fu is 4, then it's branch_idx
        if (dest_fu == 4 && decoded_instruction.asm !== "wfi") {
            const branch_id =
                reservation_station_data[
                    `RESERVATION_STATION.rs_table[${i}].branch_id`
                ];
            branch_ids[i] = branch_id;
        }

        const branch_mask =
            reservation_station_data[
                `RESERVATION_STATION.rs_table[${i}].branch_mask`
            ];

        branch_masks[i] = branch_mask;
    }

    // Extract rob squash_en and restore_tail
    const resolved_branch_id =
        reservation_station_data["RESERVATION_STATION.resolved_branch_id"] ||
        "-";

    // Branch info opacity
    let branch_info_opacity = "opacity-15";
    if (branch_status !== "0") {
        branch_info_opacity = "opacity-100";
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className={`section small-section ${branch_info_opacity}`}>
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

            <div className="section sub-section">
                <h2 className="subsection-header">RS</h2>
                <div className="flex flex-row gap-x-1">
                    {/* Table */}
                    <table className="rs-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>PC</th>
                                <th>Inst</th>
                                <th>T_dst</th>
                                <th>T_1</th>
                                <th>T_2</th>
                                <th>Imm</th>
                                <th>B_ID</th>
                                <th>B_Mask</th>
                            </tr>
                        </thead>

                        {/* Actual Register Values */}
                        <tbody>
                            {Array.from({ length: RS_SIZE }, (_, i) => {
                                const is_valid = valids[i];
                                const entry_color = rs_entry_color(is_valid);
                                // Display the entries accordingly
                                return (
                                    <tr key={i}>
                                        <td className={entry_color}>{i}</td>
                                        <td className={entry_color}>
                                            {is_valid ? pcs[i] : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {is_valid ? instructions[i] : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {is_valid
                                                ? destination_tags[i]
                                                : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {is_valid ? t1s[i] : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {is_valid ? t2s[i] : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {is_valid ? immediates[i] : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {is_valid ? branch_ids[i] : ""}
                                        </td>
                                        <td className={entry_color}>
                                            {is_valid ? branch_masks[i] : ""}
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
                <h1 className="mainsection-header">Reservation Station</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default ReservationStation;
