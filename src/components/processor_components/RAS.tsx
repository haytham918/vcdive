"use client";
import { convert_hex_to_dec, process_values, segment_idx } from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";
import { NumberSystem } from "@/app/debugger/page";
import React from "react";
let RAS_SIZE = 16;
const RAS_SEGMENT_SIZE = 8;

const RAS: React.FC<{
    ras_data: any;
    selected_number_sys: NumberSystem;
    branch_status: string;
}> = ({ ras_data, selected_number_sys, branch_status }) => {
    const [show_subsection, setShowSubsection] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    if (ras_data["RETURN_ADDRESS_STACK.RAS_DEPTH"]) {
        RAS_SIZE = convert_hex_to_dec(ras_data["RETURN_ADDRESS_STACK.RAS_DEPTH"]);
    }

    // Get the top and address info
    const ras_tops: string[] = Array(RAS_SIZE).fill("");
    const ras_addrs: string[] = Array(RAS_SIZE).fill("");
    const ras_colors: string[] = Array(RAS_SIZE).fill("");
    if (ras_data["RETURN_ADDRESS_STACK.top"]) {
        const top = convert_hex_to_dec(ras_data["RETURN_ADDRESS_STACK.top"]);
        for (let i = 0; i < RAS_SIZE; i++) {
            if (i == top) {
                ras_tops[i] = "top";
                ras_colors[i] = "cyan";
            }
            ras_addrs[i] = process_values(
                ras_data[`RETURN_ADDRESS_STACK.buffer[${i}]`],
                selected_number_sys,
                false,
                false
            );
        }
    }

    const RAS_INDEX_SEGMENTS = segment_idx(RAS_SEGMENT_SIZE, RAS_SIZE);

    const ras_tables = RAS_INDEX_SEGMENTS.map((segment, segment_idx) => (
        <table className="ras-table" key={segment_idx}>
            <thead>
                <tr>
                    <th>top?</th>
                    <th>#</th>
                    <th>Ret_Addr</th>
                </tr>
            </thead>

            {/* Actual Register Values */}
            <tbody>
                {Array.from({ length: RAS_SEGMENT_SIZE }, (_, i) => {
                    const actual_index = RAS_SEGMENT_SIZE * segment_idx + i;
                    return (
                        <tr key={i}>
                            <td className={ras_colors[actual_index]}>
                                {ras_tops[actual_index]}
                            </td>
                            <td className={ras_colors[actual_index]}>
                                {actual_index}
                            </td>
                            <td className={ras_colors[actual_index]}>
                                {ras_addrs[actual_index]}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    ));

    let is_push = false;
    let push_val = "-";
    let push_info_opacity = "opacity-15";
    let is_pop = false;
    let pop_val = "-";
    let pop_info_opacity = "opacity-15";
    if (ras_data["RETURN_ADDRESS_STACK.should_push"]) {
        is_push = ras_data["RETURN_ADDRESS_STACK.should_push"] === "1";
        if (is_push) {
            push_info_opacity = "opacity-100";
            const pc = convert_hex_to_dec(ras_data["RETURN_ADDRESS_STACK.pc"]);
            const npc = pc + 4;
            push_val = process_values(npc.toString(16), selected_number_sys);
        }
        is_pop = ras_data["RETURN_ADDRESS_STACK.should_pop"] === "1";
        if (is_pop) {
            pop_info_opacity = "opacity-100";
            pop_val = process_values(
                ras_data["RETURN_ADDRESS_STACK.prediction"],
                selected_number_sys
            );
        }
    }

    // Branch Info Opacity
    let restore_info_capacity = "opacity-15";
    let restore_top = 0;
    if (branch_status === "1") {
        restore_info_capacity = "opacity-100";
        restore_top =
            convert_hex_to_dec(
                ras_data["RETURN_ADDRESS_STACK.ras_restore_data"]
            ) || 0;
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className="flex flex-row gap-x-2">
                <div
                    className={`section small-section ${restore_info_capacity}`}
                >
                    <p className="smallsection-text w-[140px] flex flex-row">
                        Restore Top:
                        <span className="font-bold ml-auto text-[--color-accent]">
                            {restore_top}
                        </span>
                    </p>
                </div>

                <div className={`section small-section ${push_info_opacity}`}>
                    <p className="smallsection-text w-[160px] flex flex-row">
                        Push Val:
                        <span className="font-bold ml-auto text-[--color-babyblue]">
                            {push_val}
                        </span>
                    </p>
                </div>

                <div className={`section small-section ${pop_info_opacity}`}>
                    <p className="smallsection-text w-[160px] flex flex-row">
                        Pop Val:
                        <span className="font-bold ml-auto text-[--color-babyblue]">
                            {pop_val}
                        </span>
                    </p>
                </div>
            </div>

            <div className="section sub-section">
                <h2 className="subsection-header">RAS</h2>
                <div className="flex flex-row gap-x-2">{ras_tables}</div>
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">Return Address Stack</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default React.memo(RAS);
