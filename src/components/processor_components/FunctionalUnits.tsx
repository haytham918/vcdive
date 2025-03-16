"use client";
import {
    convert_hex_to_dec,
    parse_instruction,
    process_values,
} from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";
import { NumberSystem } from "@/app/debugger/page";

const ALU_SIZE = 2;
const MULT_SIZE = 2;
const CONTROL_SIZE = 1;

// Entry color
const rs_entry_color = (is_valid: boolean) => {
    return is_valid ? "cyan" : "";
};

const FunctionalUnits: React.FC<{
    selected_number_sys: NumberSystem;
    alu_data: any;
    mult_data: any;
    control_data: any;
}> = ({ selected_number_sys, alu_data, mult_data, control_data }) => {
    const [show_subsection, setShowSubsection] = useState(true);
    const [show_squash, setShowSquash] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Open / Close Squash info
    const handleSquashClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSquash(!show_squash);
    };

  
    const subsection_comp = show_subsection ? (
        <div>
            {/* Squash Info */}
            <div className="section small-section">
                <a onClick={handleSquashClick}>
                    <h3 className="smallsection-header">Squash</h3>
                </a>
                {show_squash ? (
                    <>
                        <p className="smallsection-text">
                            Squash Enable:{" "}
                            <span
                                className={`font-bold ${
                                    is_squash
                                        ? "text-[--color-primary]"
                                        : "text-[--color-accent]"
                                }`}
                            >
                                {is_squash ? "True" : "False"}
                            </span>
                        </p>

                        {is_squash ? (
                            <p className="smallsection-text w-[100%] flex flex-row">
                                Branch Squash:
                                <span className="font-bold ml-auto text-[--color-accent]">
                                    {branch_to_squash}
                                </span>
                            </p>
                        ) : null}
                    </>
                ) : null}
            </div>

            <div className="section sub-section">
                <h2 className="subsection-header">ALU</h2>
                <div className="flex flex-row gap-x-1">
                    {/* Table */}
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>OP</th>
                                <th>T_dst</th>
                                <th>T_1</th>
                                <th>T_2</th>
                                <th>Imm</th>
                                <th>PC_Val</th>
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
                                            {is_valid ? pcs[i] : ""}
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
                <h1 className="mainsection-header">Functional Units</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default FunctionalUnits;
