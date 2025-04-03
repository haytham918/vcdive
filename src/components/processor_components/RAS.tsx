"use client";
import {
    convert_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
    parse_instruction,
    process_values,
    reverse_string,
} from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";
import { NumberSystem } from "@/app/debugger/page";

let RAS_SIZE = 16;

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

    if (ras_data["RAS.RAS_DEPTH"]) {
        RAS_SIZE = convert_hex_to_dec(ras_data["RAS.RAS_DEPTH"]);
    }

    // Get the top and address info
    const ras_tops: string[] = Array(RAS_SIZE).fill("");
    const ras_addrs: string[] = Array(RAS_SIZE).fill("");
    const ras_colors: string[] = Array(RAS_SIZE).fill("");
    if (ras_data["RAS.top"]) {
        const top = convert_hex_to_dec(ras_data["RAS.top"]);
        for (let i = 0; i < RAS_SIZE; i++) {
            if (i == top) {
                ras_tops[i] = "top";
                ras_colors[i] = "cyan";
            }
            ras_addrs[i] = process_values(
                ras_data[`RAS.buffer[${i}]`],
                selected_number_sys,
                false,
                false
            );
        }
    }

    let is_push = false;
    let push_val = "0";
    let push_info_opacity = "opacity-15";
    let is_pop = false;
    let pop_val = "0";
    let pop_info_opacity = "opacity-15";
    if (ras_data["RAS.should_push"]) {
        is_push = ras_data["RAS.should_push"] === "1";
        if (is_push) {
            push_info_opacity = "opacity-100";
            const pc = convert_hex_to_dec(ras_data["RAS.pc"]);
            const npc = pc + 4;
            push_val = process_values(npc.toString(16), selected_number_sys);
        }
        is_pop = ras_data["RAS.should_pop"] === "1";
        if (is_pop) {
            pop_info_opacity = "opacity-100";
            pop_val = process_values(
                ras_data["RAS.prediction"],
                selected_number_sys
            );
        }
    }

    // Branch Info Opacity
    let restore_info_capacity = "opacity-15";
    let restore_top = 0;
    if (branch_status === "1") {
        restore_info_capacity = "opacity-100";
        restore_top = convert_hex_to_dec(ras_data["RAS.ras_restore_data"]);
    }

    const subsection_comp = show_subsection ? (
        <div>
            <div className="flex flex-row gap-x-2">
                <div
                    className={`section small-section ${restore_info_capacity}`}
                >
                    <p className="smallsection-text w-[100%] flex flex-row">
                        Restore Top:
                        <span className="font-bold ml-2 text-[--color-accent]">
                            {restore_top}
                        </span>
                    </p>
                </div>

                <div className={`section small-section ${push_info_opacity}`}>
                    <p className="smallsection-text w-[100%] flex flex-row">
                        Push Val:
                        <span className="font-bold ml-2 text-[--color-accent]">
                            {push_val}
                        </span>
                    </p>
                </div>
            </div>

            <div className="section sub-section">
                <h2 className="subsection-header">RAS</h2>
                {/* Table */}
                <table className="ras-table">
                    <thead>
                        <tr>
                            <th>top?</th>
                            <th>#</th>
                            <th>Ret_Addr</th>
                        </tr>
                    </thead>

                    {/* Actual Register Values */}
                    <tbody>
                        {Array.from({ length: RAS_SIZE }, (_, i) => (
                            <tr key={i}>
                                <td className={ras_colors[i]}>{ras_tops[i]}</td>
                                <td className={ras_colors[i]}>{i}</td>
                                <td className={ras_colors[i]}>
                                    {ras_addrs[i]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

export default RAS;
