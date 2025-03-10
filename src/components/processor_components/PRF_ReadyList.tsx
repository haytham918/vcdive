"use client";
import { NumberSystem } from "@/app/debugger/page";
import "./Section.css";
import { MouseEvent, useState } from "react";
import {
    process_values,
    reverse_string,
    segment_mask_table,
} from "@/lib/utils";

const PRF_SEGMENT_SIZE = 16;

const PRF_ReadyList: React.FC<{
    selected_number_sys: NumberSystem;
    ready_list_data: any;
    prf_data: any;
}> = ({ selected_number_sys, ready_list_data, prf_data }) => {
    const [show_subsection, setShowSubsection] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Extract the ready_list_data and Reverse it
    const ready_state_mask: string = reverse_string(
        ready_list_data["READY_LIST.ready_state_mask"]
    );
    // Segment the mask
    const ready_segments =
        ready_state_mask != ""
            ? segment_mask_table(PRF_SEGMENT_SIZE, ready_state_mask)
            : [
                  "0".repeat(PRF_SEGMENT_SIZE),
                  "0".repeat(PRF_SEGMENT_SIZE),
                  "0".repeat(PRF_SEGMENT_SIZE),
                  "0".repeat(PRF_SEGMENT_SIZE),
              ];
    // console.log(ready_segments);

    const prf_vals: (string | number)[] = [0];
    if (ready_state_mask) {
        for (let i = 1; i < ready_state_mask.length; i++) {
            const processed_value = process_values(
                prf_data[`REGFILE.regfile_mem.mem_data[${i}]`],
                selected_number_sys
            );
            prf_vals.push(processed_value);
        }
    }

    const tables = ready_segments.map((ready_segment, segment_index) => (
        <table key={segment_index}>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Value</th>
                    <th>Ready</th>
                </tr>
            </thead>

            {/* Actual Register Values */}
            <tbody>
                {Array.from({ length: PRF_SEGMENT_SIZE }, (_, i) => {
                    const ready = ready_segment[i] == "1" ? "Y" : "N";
                    const reg_index = segment_index * PRF_SEGMENT_SIZE + i;
                    const value =
                        reg_index < prf_vals.length ? prf_vals[reg_index] : "x";
                    const is_emerald = ready === "Y" && value !== "x"; // Green: Ready and val not "x"
                    const is_red = value === "x"; // Red: value is "x"
                    // Determine cell color
                    let color;
                    if (is_emerald) color = "emerald";
                    else if (is_red) color = "red";
                    else color = "";
                    return (
                        <tr key={i}>
                            <td className={color}>{reg_index}</td>
                            <td className={color}>{value}</td>
                            <td className={color}>{ready}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    ));

    const subsection_comp = show_subsection ? (
        <div className="section sub-section">
            <h2 className="subsection-header">Status</h2>

            <div className="flex flex-row gap-x-1">
                {/* Creating Segment Tables */}
                {tables}
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">
                    Physical Registers + Ready List
                </h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default PRF_ReadyList;
