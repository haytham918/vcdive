"use client";
import { NumberSystem } from "@/app/debugger/page";
import "./Section.css";
import { MouseEvent, useState } from "react";
import {
    convert_hex_to_dec,
    process_values,
    reverse_string,
    segment_idx,
    segment_mask_table,
} from "@/lib/utils";

export const PRF_SIZE = 64;
export const PRF_SEGMENT_SIZE = 16;
export const PRF_INDEX_SEGMENTS = segment_idx(PRF_SEGMENT_SIZE, PRF_SIZE);
let READ_WRITE_SEGMENT_SIZE = 5;

const PRF_Ready_Free: React.FC<{
    selected_number_sys: NumberSystem;
    ready_list_data: any;
    prf_data: any;
    current_free_list: string;
}> = ({
    selected_number_sys,
    ready_list_data,
    prf_data,
    current_free_list,
}) => {
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const [show_read, setShowRead] = useState(true);
    const [show_write, setShowWrite] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Open close read ports
    const handleReadClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowRead(!show_read);
    };

    // Open close write ports
    const handleWriteClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowWrite(!show_write);
    };

    // Read Write Ports Info
    let READ_PORTS_SIZE = 13;
    if (prf_data["REGFILE.READ_PORTS"]) {
        READ_PORTS_SIZE = convert_hex_to_dec(prf_data["REGFILE.READ_PORTS"]);
    }
    let WRITE_PORTS_SIZE = 5;
    if (prf_data["REGFILE.WRITE_PORTS"]) {
        WRITE_PORTS_SIZE = convert_hex_to_dec(prf_data["REGFILE.WRITE_PORTS"]);
    }

    // 3 columns at most
    const three_ceil = Math.ceil(
        Math.max(READ_PORTS_SIZE, WRITE_PORTS_SIZE) / 3
    );
    // If odd, we add 1 to even
    if (three_ceil % 2) {
        READ_WRITE_SEGMENT_SIZE = three_ceil + 1;
    } else READ_WRITE_SEGMENT_SIZE = three_ceil;

    // Get Write port related info
    let write_en: string = "0".repeat(WRITE_PORTS_SIZE);
    let write_idx: (number | string)[] = Array(WRITE_PORTS_SIZE).fill("");
    let write_data: string[] = Array(WRITE_PORTS_SIZE).fill("");
    if (prf_data["REGFILE.write_en"]) {
        write_en = reverse_string(prf_data["REGFILE.write_en"]);
        for (let i = 0; i < WRITE_PORTS_SIZE; i++) {
            // If it's actually writing
            if (write_en[i] === "1") {
                write_idx[i] = convert_hex_to_dec(
                    prf_data[`REGFILE.write_idx[${i}]`]
                );
                write_data[i] = process_values(
                    prf_data[`REGFILE.write_data[${i}]`],
                    selected_number_sys
                );
            }
        }
    }

    const write_ports_segment_index = segment_idx(
        READ_WRITE_SEGMENT_SIZE,
        WRITE_PORTS_SIZE
    );

    // Write Ports Table layout
    const write_ports_tables = write_ports_segment_index.map(
        (segment, segment_index) => (
            <table key={segment_index} className="read-write-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Idx</th>
                        <th>Val</th>
                    </tr>
                </thead>

                {/* Write Values */}
                <tbody>
                    {Array.from({ length: READ_WRITE_SEGMENT_SIZE }, (_, i) => {
                        const is_valid = segment[i] < WRITE_PORTS_SIZE;
                        const idx = is_valid ? segment[i] : "-";
                        let color = "";

                        let write_index: string | number = "";
                        let write_val = "";
                        // Only if the idx is less than or equal to actual size
                        if (is_valid) {
                            if (write_en[segment[i]] === "1") {
                                color = "cyan";
                                write_index = write_idx[segment[i]];
                                write_val = write_data[segment[i]];
                            }
                        }
                        return (
                            <tr key={i}>
                                <td className={color}>{idx}</td>
                                <td className={color}>{write_index}</td>
                                <td className={color}>{write_val}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )
    );

    // Get read port related info
    let read_idx: (number | string)[] = Array(READ_PORTS_SIZE).fill("");
    let read_data: string[] = Array(READ_PORTS_SIZE).fill("");
    for (let i = 0; i < READ_PORTS_SIZE; i++) {
        const read_idx_str = prf_data[`REGFILE.read_idx[${i}]`];
        if (read_idx_str && read_idx_str !== "x") {
            const read_idx_val = convert_hex_to_dec(read_idx_str);
            read_idx[i] = read_idx_val;
            // If reading 0
            if (read_idx_val === 0) {
                read_data[i] = "0";
            } else {
                // Reading non-zero value, do number sys conversion
                const read_data_val = process_values(
                    prf_data[`REGFILE.read_data[${i}]`],
                    selected_number_sys
                );
                if (read_data_val != "") {
                    read_data[i] = read_data_val;
                }
            }
        }
    }
    const read_ports_segment_index = segment_idx(
        READ_WRITE_SEGMENT_SIZE,
        READ_PORTS_SIZE
    );

    // Read Ports Table Layout
    const read_ports_tables = read_ports_segment_index.map(
        (segment, segment_index) => (
            <table key={segment_index} className="read-write-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Idx</th>
                        <th>Val</th>
                    </tr>
                </thead>

                {/* Read Values */}
                <tbody>
                    {Array.from({ length: READ_WRITE_SEGMENT_SIZE }, (_, i) => {
                        const is_valid = segment[i] < READ_PORTS_SIZE;
                        const idx = is_valid ? segment[i] : "-";
                        let color = "";

                        let read_index: string | number = "";
                        let read_val = "";
                        // Only if the idx is less than or equal to actual size
                        if (is_valid) {
                            // If read_idx is legitimate
                            if (read_idx[segment[i]] !== "") {
                                color =
                                    read_idx[segment[i]] !== 0 ? "cyan" : "";
                                read_index = read_idx[segment[i]];
                                read_val = read_data[segment[i]];
                            }
                        }
                        return (
                            <tr key={i}>
                                <td className={color}>{idx}</td>
                                <td className={color}>{read_index}</td>
                                <td className={color}>{read_val}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )
    );

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

    const prf_vals: string[] = ["0"];
    if (ready_state_mask) {
        for (let i = 1; i < ready_state_mask.length; i++) {
            const processed_value = process_values(
                prf_data[`REGFILE.regfile_mem.mem_data[${i}]`],
                selected_number_sys
            );
            prf_vals.push(processed_value);
        }
    }

    const prf_tables = ready_segments.map((ready_segment, segment_index) => (
        <table key={segment_index} className="prf-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Value</th>
                    <th>Ready</th>
                    <th>Free</th>
                </tr>
            </thead>

            {/* Actual Register Values */}
            <tbody>
                {Array.from({ length: PRF_SEGMENT_SIZE }, (_, i) => {
                    const ready = ready_segment[i] == "1" ? "Y" : "N";
                    const reg_index = segment_index * PRF_SEGMENT_SIZE + i;
                    const value =
                        reg_index < prf_vals.length ? prf_vals[reg_index] : "x";
                    let free = "x";
                    if (reg_index < prf_vals.length) {
                        free = current_free_list[reg_index] === "1" ? "Y" : "N";
                    }

                    // Determine Cell Color
                    let color = "";
                    // If Ready and Value is not x
                    if (ready === "Y" && value !== "x") {
                        color = "emerald";
                    }
                    // If it's free
                    else if (free === "Y") {
                        color = "yellow";
                    }
                    // If value is x
                    else if (value == "x") {
                        color = "red";
                    }

                    return (
                        <tr key={i}>
                            <td className={color}>{reg_index}</td>
                            <td className={color}>{value}</td>
                            <td className={color}>{ready}</td>
                            <td className={color}>{free}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    ));

    const subsection_comp = show_subsection ? (
        <div>
            {/* Read and Write Ports */}
            <div className="flex">
                <div className="section small-section">
                    <a onClick={handleReadClick}>
                        <h3 className="smallsection-header">Read Ports</h3>
                    </a>
                    {show_read ? (
                        <div className="flex flex-row gap-x-1">
                            {read_ports_tables}
                        </div>
                    ) : null}
                </div>

                <div className="section write-section ml-4">
                    <a onClick={handleWriteClick}>
                        <h3 className="smallsection-header">Write Ports</h3>
                    </a>
                    {show_write ? (
                        <div className="flex gap-x-1">{write_ports_tables}</div>
                    ) : null}
                </div>
            </div>

            <div className="section sub-section">
                <h2 className="subsection-header">PRF Status</h2>

                <div className="flex flex-row gap-x-1">
                    {/* Creating Segment Tables */}
                    {prf_tables}
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">
                    Physical Registers + Ready + Free
                </h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default PRF_Ready_Free;
