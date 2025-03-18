"use client";
import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css";
import { convert_hex_to_dec, segment_idx } from "@/lib/utils";
const MapTable: React.FC<{
    map_table_data: any;
}> = ({ map_table_data }) => {
    const MAP_TABLE_SIZE = 32;
    const MAP_TABLE_SEGMENT_SIZE = 8;

    const index_segments = segment_idx(MAP_TABLE_SEGMENT_SIZE, MAP_TABLE_SIZE);

    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    const current_map_values: number[] = Array(MAP_TABLE_SIZE).fill(0);
    for (let i = 0; i < MAP_TABLE_SIZE; i++) {
        current_map_values[i] = convert_hex_to_dec(
            map_table_data[`MAP_TABLE_BRAT_WORKER.current_state[${i}]`]
        );
    }

    const next_map_values: number[] = Array(MAP_TABLE_SIZE).fill(0);
    for (let i = 0; i < MAP_TABLE_SIZE; i++) {
        next_map_values[i] = convert_hex_to_dec(
            map_table_data[`MAP_TABLE_BRAT_WORKER.next_state[${i}]`]
        );
    }
    // Segment Map Tables
    const map_tables = index_segments.map((segment, segment_idx) => (
        <table key={segment_idx}>
            <thead>
                <tr>
                    <th>Arc</th>
                    <th>Current</th>
                    <th>Next</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: MAP_TABLE_SEGMENT_SIZE }, (_, i) => {
                    let entry_color = "";
                    // Set color to cyan if new mapping
                    if (
                        next_map_values[segment[i]] !==
                        current_map_values[segment[i]]
                    ) {
                        entry_color = "beige";
                    }
                    return (
                        <tr key={i}>
                            <td className={entry_color}>{segment[i]}</td>
                            <td className={entry_color}>
                                {current_map_values[segment[i]]}
                            </td>
                            <td className={entry_color}>
                                {next_map_values[segment[i]]}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    ));

    const subsection_comp = show_subsection ? (
        <div>
            <div className="section sub-section">
                <h2 className="subsection-header">Map</h2>

                <div className="flex flex-row gap-x-1">{map_tables}</div>
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">Map Table</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default MapTable;
