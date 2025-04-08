import "./Section.css";
import { MouseEvent, useState } from "react";
import { convert_hex_to_dec, reverse_string } from "@/lib/utils";
import {
    MAP_TABLE_INDEX_SEGMENTS,
    MAP_TABLE_SEGMENT_SIZE,
    MAP_TABLE_SIZE,
} from "./MapTable";
import { PRF_INDEX_SEGMENTS, PRF_SEGMENT_SIZE } from "./PRF_Ready_Free";
import { GSHARE_LENGTH } from "./BranchGshare";
import React from "react";
const Brat: React.FC<{
    free_ids_mask: string;
    free_list_data: any;
    map_table_data: any;
    rob_tail_data: any;
    gbhr_checkpoint_data: any;
    ras_checkpoint_data: any;
    sq_tail_data: any;
}> = ({
    free_ids_mask,
    free_list_data,
    map_table_data,
    rob_tail_data,
    gbhr_checkpoint_data,
    ras_checkpoint_data,
    sq_tail_data,
}) => {
    let CHECKPOINT_LENGTH = 4;
    if (free_ids_mask) {
        CHECKPOINT_LENGTH = free_ids_mask.length;
    }

    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const [show_checkpoint, setShowCheckPoint] = useState(
        Array(CHECKPOINT_LENGTH).fill(false)
    );

    // Open/Close checkpoint
    const handleCheckpointDisplay = (event: MouseEvent, index: number) => {
        const copy = [...show_checkpoint];
        copy[index] = !copy[index];
        setShowCheckPoint(copy);
    };

    // Open / Close subsection when clicking the header
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Reverse free_ids_mask
    let reversed_free_ids_mask: string = "1111";
    if (free_ids_mask) reversed_free_ids_mask = reverse_string(free_ids_mask);

    const free_id_mask_display = (
        <h3 className="font-bold">
            Free BRAT MASK:{" "}
            {free_ids_mask
                ? Array.from({ length: CHECKPOINT_LENGTH }, (_, i) => {
                      let color = "text-[--color-primary]";
                      if (free_ids_mask && free_ids_mask[i] === "0") {
                          color = "text-[--color-accent]";
                      }
                      return (
                          <span className={color} key={i}>
                              {free_ids_mask[i]}
                          </span>
                      );
                  })
                : "0000"}
        </h3>
    );

    const checkpoint_tables = (
        // Container to contain all checkpoints
        <div className="flex gap-x-4">
            {Array.from({ length: CHECKPOINT_LENGTH }, (_, original_index) => {
                const reverse_index = CHECKPOINT_LENGTH - original_index - 1;
                const is_display = show_checkpoint[original_index];
                // If current checkpoint is still free, grey out by set opacity
                let show_opacity: string = "opacity-100";
                if (reversed_free_ids_mask[reverse_index] == "1") {
                    show_opacity = "opacity-25";
                }

                // Get checkpoint id use original index
                let id: string = "0".repeat(CHECKPOINT_LENGTH);
                id =
                    id.substring(0, original_index) +
                    "1" +
                    id.substring(original_index + 1);
                const checkpoint_id_display = (
                    <h2 className="subsection-header underline-text">
                        Checkpoint:{" "}
                        {Array.from({ length: CHECKPOINT_LENGTH }, (_, i) => {
                            let color = "";
                            if (id[i] === "1") {
                                color = "text-[--color-accent]";
                            }
                            return (
                                <span className={color} key={i}>
                                    {id[i]}
                                </span>
                            );
                        })}
                    </h2>
                );

                // Get Rob Tail ----------------------------------------------
                const checkpoint_rob_tail =
                    convert_hex_to_dec(
                        rob_tail_data[
                            `ROB_TAIL_BRAT_WORKER.checkpoint_data[${reverse_index}]`
                        ]
                    ) || 0;

                // Get SQ Tail -----------------------------------------------
                let checkpoint_sq_tail_pointer = 0;
                let checkpoint_sq_tail_parity = 0;
                if (
                    sq_tail_data[
                        "SQ_TAIL_BRAT_WORKER.checkpoint_data[0].pointer"
                    ]
                ) {
                    checkpoint_sq_tail_pointer = convert_hex_to_dec(
                        sq_tail_data[
                            `SQ_TAIL_BRAT_WORKER.checkpoint_data[${reverse_index}].pointer`
                        ]
                    ) || 0;
                    checkpoint_sq_tail_parity = convert_hex_to_dec(
                        sq_tail_data[
                            `SQ_TAIL_BRAT_WORKER.checkpoint_data[${reverse_index}].parity`
                        ]
                    ) || 0;
                }

                // Get Checkpoint GBHR --------------------------------------
                let checkpoint_gbhr = "0".repeat(GSHARE_LENGTH);
                if (
                    gbhr_checkpoint_data[`GBHR_BRAT_WORKER.checkpoint_data[0]`]
                ) {
                    checkpoint_gbhr =
                        gbhr_checkpoint_data[
                            `GBHR_BRAT_WORKER.checkpoint_data[${reverse_index}]`
                        ];
                }

                // Get Checkpoint RAS ---------------------------------------
                let checkpoint_ras = 0;
                if (ras_checkpoint_data[`RAS_BRAT_WORKER.checkpoint_data[0]`]) {
                    checkpoint_ras =
                        convert_hex_to_dec(
                            ras_checkpoint_data[
                                `RAS_BRAT_WORKER.checkpoint_data[${reverse_index}]`
                            ]
                        ) || 0;
                }

                // Map Table ---------------------------------------------------
                const checkpoint_map_table_valeus: number[] =
                    Array(MAP_TABLE_SIZE).fill(0);
                // Read the map table values from checkpoint
                for (let i = 0; i < MAP_TABLE_SIZE; i++) {
                    checkpoint_map_table_valeus[i] =
                        convert_hex_to_dec(
                            map_table_data[
                                `MAP_TABLE_BRAT_WORKER.checkpoint_data[${reverse_index}][${i}]`
                            ]
                        ) || 0;
                }

                // Segment Map Tables
                const checkpoint_map_table = MAP_TABLE_INDEX_SEGMENTS.map(
                    (segment, segment_idx) => (
                        <table key={segment_idx}>
                            <thead>
                                <tr>
                                    <th>Arc</th>
                                    <th>Phys</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(
                                    { length: MAP_TABLE_SEGMENT_SIZE },
                                    (_, i) => {
                                        return (
                                            <tr key={i}>
                                                <td className="cyan">
                                                    {segment[i]}
                                                </td>
                                                <td className="">
                                                    {
                                                        checkpoint_map_table_valeus[
                                                            segment[i]
                                                        ]
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    )
                );

                // -------------------------------------------------------------

                // ---------------------- Free List ---------------------------
                // Reversed free list string of the checkpoint
                const checkpoint_reversed_free_list_values: string =
                    reverse_string(
                        free_list_data[
                            `FREE_LIST_BRAT_WORKER.checkpoint_data[${reverse_index}]`
                        ]
                    );

                // Free List Segment
                const checkpoint_free_list = PRF_INDEX_SEGMENTS.map(
                    (segment, segment_idx) => (
                        <table key={segment_idx}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Free</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from(
                                    { length: PRF_SEGMENT_SIZE },
                                    (_, i) => {
                                        let color = "red";
                                        let free_val = "N";
                                        if (
                                            checkpoint_reversed_free_list_values[
                                                segment[i]
                                            ] === "1"
                                        ) {
                                            free_val = "Y";
                                            color = "emerald";
                                        }
                                        return (
                                            <tr key={i}>
                                                <td>{segment[i]}</td>
                                                <td className={color}>
                                                    {free_val}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    )
                );

                // ------------------------------------------------------------

                return (
                    <div
                        className={`section sub-section ${show_opacity}`}
                        key={original_index}
                    >
                        <a
                            onClick={(e) =>
                                handleCheckpointDisplay(e, original_index)
                            }
                        >
                            {checkpoint_id_display}
                        </a>
                        {is_display ? (
                            <div className="w-[100%] flex flex-col gap-y-1.5">
                                {/* Rob Tail Info */}
                                <h3 className="smallsection-text font-bold">
                                    ROB Tail:{" "}
                                    <span className="text-[--color-primary]">
                                        {checkpoint_rob_tail}
                                    </span>
                                </h3>

                                {/* SQ Tail Info */}
                                <h3 className="smallsection-text font-bold">
                                    SQ Tail Pointer:{" "}
                                    <span className="text-[--color-babyblue]">
                                        {checkpoint_sq_tail_pointer}
                                    </span>
                                </h3>

                                {/* SQ Tail Parity Info */}
                                <h3 className="smallsection-text font-bold">
                                    SQ Tail Parity:{" "}
                                    <span className="text-[--color-babyblue]">
                                        {checkpoint_sq_tail_parity}
                                    </span>
                                </h3>

                                {/* Gshare Info */}
                                <div className="flex smallsection-text font-bold">
                                    Gshare:{" "}
                                    <div className="ml-2">
                                        {Array.from(
                                            { length: GSHARE_LENGTH },
                                            (_, i) => {
                                                let history_color = "";
                                                if (
                                                    checkpoint_gbhr[i] === "0"
                                                ) {
                                                    history_color =
                                                        "text-[--color-accent]";
                                                } else {
                                                    history_color =
                                                        "text-[--color-primary]";
                                                }
                                                return (
                                                    <span
                                                        className={
                                                            history_color
                                                        }
                                                        key={i}
                                                    >
                                                        {checkpoint_gbhr[i]}
                                                    </span>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* RAS TOP Info */}
                                <h3 className="smallsection-text font-bold">
                                    RAS Top:{" "}
                                    <span className="text-[--color-babyblue]">
                                        {checkpoint_ras}
                                    </span>
                                </h3>

                                {/* Map Table Part */}
                                <div className="inner-section section">
                                    <h3 className="smallsection-text font-bold mb-2">
                                        Map Table
                                    </h3>
                                    <div className="flex gap-x-1">
                                        {checkpoint_map_table}
                                    </div>
                                </div>

                                {/* Free List Part */}
                                <div className="inner-section section">
                                    <h3 className="smallsection-text font-bold mb-2">
                                        Free List
                                    </h3>
                                    <div className="flex gap-x-1">
                                        {checkpoint_free_list}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );

    const subsection_comp = show_subsection ? (
        <div className="items-center justify-center flex flex-col">
            {free_id_mask_display}

            {/* Each Checkpoint Info */}
            {checkpoint_tables}
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">BRAT</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default React.memo(Brat);
