"use client";
import {
    convert_reg_hex_to_dec,
    fifo_entry_color,
    head_tail_comp,
} from "@/lib/utils";
import "./Section.css";
import { MouseEvent, useState } from "react";

const ROB_SIZE = 32;

const ReorderBuffer: React.FC<{ rob_data: any }> = ({ rob_data }) => {
    const [show_subsection, setShowSubsection] = useState(true);

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Get the destination_tag
    const destination_tags: number[] = [];
    for (let i = 0; i < ROB_SIZE; i++) {
        const key = `ROB.rob_data[${i}].destination_tag`;
        destination_tags.push(convert_reg_hex_to_dec(rob_data[key]) || 0);
    }

    // Get the old tag
    const tag_olds: number[] = [];
    for (let i = 0; i < ROB_SIZE; i++) {
        const key = `ROB.rob_data[${i}].tag_old`;
        tag_olds.push(convert_reg_hex_to_dec(rob_data[key]) || 0);
    }

    // TODO: DO the above in one for loop

    // Extract rob head and tail
    const rob_head = convert_reg_hex_to_dec(rob_data["ROB.head"]);
    const rob_tail = convert_reg_hex_to_dec(rob_data["ROB.tail"]);
    const rob_num_free = convert_reg_hex_to_dec(rob_data["ROB.num_free"]);

    const subsection_comp = show_subsection ? (
        <div className="section sub-section">
            <h2 className="subsection-header">ROB</h2>

            <div className="flex flex-row gap-x-1">
                {/* Table */}
                <table>
                    <thead>
                        <tr>
                            <th>h/t</th>
                            <th>#</th>
                            <th>T_dst</th>
                            <th>T_old</th>
                        </tr>
                    </thead>

                    {/* Actual Register Values */}
                    <tbody>
                        {Array.from({ length: ROB_SIZE }, (_, i) => {
                            const color = fifo_entry_color(
                                i,
                                rob_head,
                                rob_tail,
                                rob_num_free,
                                ROB_SIZE
                            );
                            const head_tail = head_tail_comp(
                                i,
                                rob_head,
                                rob_tail
                            );
                            return (
                                <tr key={i} className="blue">
                                    <td className={color}>{head_tail}</td>
                                    <td className={color}>{i}</td>
                                    <td className={color}>
                                        {color != "" ? destination_tags[i] : ""}
                                    </td>
                                    <td className={color}>
                                        {color != "" ? tag_olds[i] : ""}
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
                <h1 className="mainsection-header">Reorder Buffer</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default ReorderBuffer;
