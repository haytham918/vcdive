import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css";
import {
    convert_hex_to_dec,
    parse_instruction,
    process_values,
    segment_idx,
} from "@/lib/utils";
import { NumberSystem } from "@/app/debugger/page";
import React from "react";

let ICACHE_NUM_BANKS = 2; // Number of BANKS
let ICACHE_NUM_SETS = 4; // Number of Sets per Bank
let ICACHE_NUM_WAYS = 4; // Number of Ways per Set
let ICACHE_BANK_ENTRY_SIZE = 16; // Number of Cachelines per Bank
const MSHR_SEGMENT_SIZE = 8; // SEGMENT SIZE for MSHR
let MSHR_SIZE = 16; // Size of MSHR
let PSB_SIZE = 4; // Size of Prefetch Stream Buffer
let NUM_PSB = 2; // Number of PSB
const Icache: React.FC<{
    select_number_sys: NumberSystem;
    icache_data: any;
}> = ({ select_number_sys, icache_data }) => {
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Set parametes
    if (icache_data["ICACHE.NUM_BANKS"]) {
        ICACHE_NUM_BANKS = convert_hex_to_dec(icache_data["ICACHE.NUM_BANKS"]);
        ICACHE_NUM_SETS = convert_hex_to_dec(
            icache_data["ICACHE.NUM_SETS_PER_BANK"]
        );
        ICACHE_NUM_WAYS = convert_hex_to_dec(
            icache_data["ICACHE.ASSOCIATIVITY"]
        );
        ICACHE_BANK_ENTRY_SIZE = ICACHE_NUM_SETS * ICACHE_NUM_WAYS;
    }

    // Function to generate each bank's information
    const generate_icache_bank = (bank_index: number) => {
        const set_nums: (string | number)[] = Array(
            ICACHE_BANK_ENTRY_SIZE
        ).fill("");
        const way_nums: (string | number)[] = Array(
            ICACHE_BANK_ENTRY_SIZE
        ).fill("");
        const valids: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("0");
        const is_hands: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("");
        const refs: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("-");
        const tags: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("-");
        const low_datas: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("-");
        const high_datas: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("-");
        const colors: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("");

        // Check if eviction enabled
        let is_evict = false;
        if (icache_data["ICACHE.evict_en"]) {
            is_evict =
                icache_data["ICACHE.evict_en"][
                    ICACHE_NUM_BANKS - 1 - bank_index
                ] === "1";
        }

        const eviction_opacity = is_evict ? "opacity-100" : "opacity-15";

        // Check if read request valid and what
        let read_granted = false;
        let read_address = "0".repeat(8);
        if (icache_data["ICACHE.bank_read_request_granted"]) {
            read_granted =
                icache_data["ICACHE.bank_read_request_granted"][
                    ICACHE_NUM_BANKS - 1 - bank_index
                ] === "1";

            if (read_granted) {
                let binary_addr =
                    icache_data[
                        `ICACHE.bank_read_request_address[${bank_index}].tag`
                    ] +
                    icache_data[
                        `ICACHE.bank_read_request_address[${bank_index}].set_index`
                    ] +
                    icache_data[
                        `ICACHE.bank_read_request_address[${bank_index}].bank_number`
                    ] +
                    icache_data[
                        `ICACHE.bank_read_request_address[${bank_index}].offset`
                    ];
                binary_addr = parseInt(binary_addr, 2);
                const hex_addr = binary_addr.toString(16).padStart(8, "0");
                read_address = process_values(
                    hex_addr,
                    select_number_sys,
                    false,
                    false
                );
            }
        }

        const read_opacity = read_granted ? "opacity-100" : "opacity-15";

        // Check each entry val
        for (let i = 0; i < ICACHE_BANK_ENTRY_SIZE; i++) {
            const set = Math.floor(i / ICACHE_NUM_WAYS); // Get the set index
            const way = i % ICACHE_NUM_WAYS; // Get the way index

            // Set the set index if way === 0
            if (way === 0) {
                set_nums[i] = set;
            }
            way_nums[i] = way;

            // Set color
            colors[i] = `set${set}`;
            valids[i] =
                icache_data[
                    `ICACHE.gen_cache[${bank_index}].ICACHE_BANK.memdp_metadata[${set}][${way}].valid`
                ];

            // Get hand val
            const set_hand =
                convert_hex_to_dec(
                    icache_data[
                        `ICACHE.gen_cache[${bank_index}].EVICTION_POLICY.clock_queues[${set}].hand`
                    ]
                ) || 0;
            if (set_hand == way) {
                is_hands[i] = "h";
            }

            // Set other values if it's valid
            if (valids[i] === "1") {
                // Get referenced
                refs[i] =
                    icache_data[
                        `ICACHE.gen_cache[${bank_index}].EVICTION_POLICY.clock_queues[${set}].referenced`
                    ][ICACHE_NUM_WAYS - 1 - way];

                // Get tag
                const raw_tag =
                    icache_data[
                        `ICACHE.gen_cache[${bank_index}].ICACHE_BANK.memdp_metadata[${set}][${way}].tag`
                    ];
                tags[i] = parseInt(raw_tag, 2).toString(2);

                // Get actual data
                const bank_hex_data: string =
                    icache_data[
                        `ICACHE.gen_cache[${bank_index}].ICACHE_BANK.gen_memdp[${way}].memdp_per_way.memData[${set}]`
                    ];

                const low_data = bank_hex_data.substring(8);
                const high_data = bank_hex_data.substring(0, 8);

                low_datas[i] = parse_instruction(low_data).asm;
                high_datas[i] = parse_instruction(high_data).asm;
            }
        }
        return (
            <div className="section sub-section" key={bank_index}>
                <h2 className="subsection-header">Bank {bank_index}</h2>
                <div className="mb-2 flex flex-row w-[100%] ml-4 gap-x-4">
                    <div
                        className={`section inner-section ${eviction_opacity}`}
                    >
                        <p className="smallsection-text flex flex-row">
                            Evict En:
                            <span className="font-bold ml-2 text-[--color-primary]">
                                {is_evict ? "1" : "0"}
                            </span>
                        </p>
                    </div>

                    <div className={`section inner-section ${read_opacity}`}>
                        <p className="smallsection-text w-[11rem] flex flex-row">
                            Read Addr:
                            <span className="font-bold ml-auto text-[--color-babyblue]">
                                {read_address}
                            </span>
                        </p>
                    </div>
                </div>
                <table className="icache-table">
                    <thead>
                        <tr>
                            <th>Set</th>
                            <th>Way</th>
                            <th>Valid</th>
                            <th>Hand</th>
                            <th>Ref</th>
                            <th>Tag</th>
                            <th>Data</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from(
                            { length: ICACHE_BANK_ENTRY_SIZE },
                            (_, i) => (
                                <tr key={i}>
                                    <td className={colors[i]}>{set_nums[i]}</td>

                                    <td className={colors[i]}>{way_nums[i]}</td>

                                    <td className={colors[i]}>{valids[i]}</td>

                                    <td className={colors[i]}>{is_hands[i]}</td>

                                    <td className={colors[i]}>{refs[i]}</td>

                                    <td className={colors[i]}>{tags[i]}</td>

                                    <td className={`${colors[i]} leading-4`}>
                                        {low_datas[i]}
                                        <br></br>
                                        {high_datas[i]}
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    // MSHR, set the size
    if (icache_data["ICACHE.MSHR_TABLE.NUM_MSHR_UNITS"]) {
        MSHR_SIZE = convert_hex_to_dec(
            icache_data["ICACHE.MSHR_TABLE.NUM_MSHR_UNITS"]
        );
    }

    // Get the MSHR entry information
    const mshr_valids: string[] = Array(MSHR_SIZE).fill("");
    const mshr_base_addrs: (string | number)[] = Array(MSHR_SIZE).fill("-");
    const mshr_colors: string[] = Array(MSHR_SIZE).fill("");
    // set values
    if (icache_data["ICACHE.MSHR_TABLE.mshr_table[0].valid"]) {
        for (let i = 0; i < MSHR_SIZE; i++) {
            // Get valid bit
            mshr_valids[i] =
                icache_data[`ICACHE.MSHR_TABLE.mshr_table[${i}].valid`];

            // set other info if valid
            if (mshr_valids[i] === "1") {
                mshr_base_addrs[i] = process_values(
                    icache_data[
                        `ICACHE.MSHR_TABLE.mshr_table[${i}].base_address`
                    ],
                    select_number_sys,
                    false,
                    false
                );
                mshr_colors[i] = "cyan";
            }
        }
    }

    const MSHR_TABLE_INDEX_SEGMENTS = segment_idx(MSHR_SEGMENT_SIZE, MSHR_SIZE);

    const mshr_tables = MSHR_TABLE_INDEX_SEGMENTS.map(
        (segment, segment_idx) => (
            <table key={segment_idx} className="mshr-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Valid</th>
                        <th>Base_Addr</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: MSHR_SEGMENT_SIZE }, (_, i) => {
                        const actual_index =
                            segment_idx * MSHR_SEGMENT_SIZE + i;

                        return (
                            <tr key={i}>
                                <td className={mshr_colors[actual_index]}>
                                    {actual_index}
                                </td>
                                <td className={mshr_colors[actual_index]}>
                                    {mshr_valids[actual_index]}
                                </td>
                                <td className={mshr_colors[actual_index]}>
                                    {mshr_base_addrs[actual_index]}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )
    );

    // PREFETCH_STREAM_BUFFER
    if (icache_data["ICACHE.gen_psb[0].PREFETCH_STREAM_BUFFER.SIZE"]) {
        PSB_SIZE = convert_hex_to_dec(
            icache_data["ICACHE.gen_psb[0].PREFETCH_STREAM_BUFFER.SIZE"]
        );
        NUM_PSB = convert_hex_to_dec(icache_data["ICACHE.NUM_PSB"]);
    }

    // Function to generate PSB info
    const generate_psb = (bank_idx: number) => {
        const allocs: string[] = Array(PSB_SIZE).fill("0");
        const valids: string[] = Array(PSB_SIZE).fill("0");
        const addresses: string[] = Array(PSB_SIZE).fill("-");
        const datas: string[] = Array(PSB_SIZE).fill("-");
        const entry_colors = Array(PSB_SIZE).fill("");

        // Some signals
        let active = "0";
        let active_opacity = "opacity-15";
        let evict = "0";
        let evict_opacity = "opacity-15";
        let referenced = "0";
        let referenced_opacity = "opacity-15";
        let clear_referenced = "0";
        let clear_referenced_opacity = "opacity-15";
        let prefetch_addr = "0".repeat(8);
        let prefetch_gnt = "0";
        let prefetch_opacity = "opacity-15";

        const read_gnts: string[] = Array(ICACHE_NUM_BANKS).fill("0");
        const read_addrs: string[] = Array(ICACHE_NUM_BANKS).fill("-");
        const read_datas: string[] = Array(ICACHE_NUM_BANKS).fill("-");
        const read_colors: string[] = Array(ICACHE_NUM_BANKS).fill("");

        // Sanity check
        if (
            icache_data[
                `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.SIZE`
            ]
        ) {
            for (let i = 0; i < PSB_SIZE; i++) {
                // Get the alloc and valid bit
                allocs[i] =
                    icache_data[
                        `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.reg_buffer[${i}].alloc`
                    ];
                valids[i] =
                    icache_data[
                        `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.reg_buffer[${i}].data_valid`
                    ];

                // If alloc or valid
                if (allocs[i] === "1" || valids[i] === "1") {
                    // Both 1, emerald
                    if (allocs[i] === "1" && valids[i] === "1") {
                        entry_colors[i] = "emerald";
                    } else if (allocs[i] === "1") {
                        entry_colors[i] = "yellow";
                    } else {
                        entry_colors[i] = "cyan";
                    }

                    // Get the address info
                    addresses[i] = process_values(
                        icache_data[
                            `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.reg_buffer[${i}].addr`
                        ],
                        select_number_sys,
                        false,
                        false
                    );

                    // Get data
                    if (valids[i] === "1") {
                        datas[i] = process_values(
                            icache_data[
                                `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.reg_buffer[${i}].data.dbbl_level`
                            ],
                            select_number_sys
                        );
                    }
                }
            }

            // Signals and Read info
            active =
                icache_data[
                    `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.active`
                ];
            if (active === "1") active_opacity = "opacity-100";
            evict =
                icache_data[
                    `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.evict`
                ];
            if (evict === "1") evict_opacity = "opacity-100";
            referenced =
                icache_data[
                    `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.referenced`
                ];
            if (referenced === "1") referenced_opacity = "opacity-100";
            clear_referenced =
                icache_data[
                    `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.clear_referenced`
                ];
            if (clear_referenced === "1")
                clear_referenced_opacity = "opacity-100";
            prefetch_gnt =
                icache_data[
                    `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.prefetch_gnt`
                ];
            if (prefetch_gnt === "1") prefetch_opacity = "opacity-100";
            prefetch_addr = process_values(
                icache_data[
                    `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.prefetch_addr`
                ],
                select_number_sys,
                false,
                false
            );

            for (let i = 0; i < ICACHE_NUM_BANKS; i++) {
                read_gnts[i] =
                    icache_data[
                        `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.read_gnt`
                    ][ICACHE_NUM_BANKS - i - 1];
                if (read_gnts[i] === "1") {
                    read_addrs[i] = process_values(
                        icache_data[
                            `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.read_addr[${i}]`
                        ],
                        select_number_sys,
                        false,
                        false
                    );

                    read_datas[i] = process_values(
                        icache_data[
                            `ICACHE.gen_psb[${bank_idx}].PREFETCH_STREAM_BUFFER.read_data[${i}].dbbl_level`
                        ],
                        select_number_sys
                    );
                    read_colors[i] = "cyan";
                }
            }
        }

        return (
            <div className="section sub-section" key={bank_idx}>
                <h2 className="subsection-header">
                    Prefetch Stream Buffer {bank_idx}
                </h2>

                {/* Signals */}
                <div className="mb-2 ml-4 flex flex-row w-[100%] gap-x-2">
                    <div className={`section inner-section ${active_opacity}`}>
                        <p className="smallsection-text flex flex-row">
                            Active:
                            <span className="font-bold ml-2 text-[--color-primary]">
                                {active}
                            </span>
                        </p>
                    </div>

                    <div className={`section inner-section ${evict_opacity}`}>
                        <p className="smallsection-text flex flex-row">
                            Evict:
                            <span className="font-bold ml-2 text-[--color-primary]">
                                {evict}
                            </span>
                        </p>
                    </div>

                    <div
                        className={`section inner-section ${prefetch_opacity}`}
                    >
                        <p className="smallsection-text flex flex-row">
                            Pf Addr:
                            <span className="font-bold ml-2 text-[--color-babyblue]">
                                {prefetch_addr}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="mb-2 ml-4 flex flex-row w-[100%] gap-x-4">
                    <div
                        className={`section inner-section ${referenced_opacity}`}
                    >
                        <p className="smallsection-text flex flex-row">
                            Referenced:
                            <span className="font-bold ml-2 text-[--color-primary]">
                                {referenced}
                            </span>
                        </p>
                    </div>

                    <div
                        className={`section inner-section ${clear_referenced_opacity}`}
                    >
                        <p className="smallsection-text flex flex-row">
                            Clear Referenced:
                            <span className="font-bold ml-2 text-[--color-primary]">
                                {clear_referenced}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Read Stuff */}
                <div className="mb-2 inner-section partial-info-section items-center flex flex-col">
                    <h3 className="smallsection-text font-bold mb-1">
                        Read Info
                    </h3>
                    <table className="psb-read-table">
                        <thead>
                            <tr>
                                <th>Bank #</th>
                                <th>Gnt</th>
                                <th>Read_Addr</th>
                                <th>Data</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from(
                                { length: ICACHE_NUM_BANKS },
                                (_, i) => (
                                    <tr key={i}>
                                        <td className={read_colors[i]}>{i}</td>
                                        <td className={read_colors[i]}>
                                            {read_gnts[i]}
                                        </td>
                                        <td className={read_colors[i]}>
                                            {read_addrs[i]}
                                        </td>
                                        <td className={read_colors[i]}>
                                            {read_datas[i]}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="inner-section partial-info-section flex flex-col items-center">
                    <h3 className="smallsection-text font-bold mb-1">Buffer</h3>
                    <table className="psb-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Alloc</th>
                                <th>Valid</th>
                                <th>Base_Addr</th>
                                <th>Data</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from({ length: PSB_SIZE }, (_, i) => (
                                <tr key={i}>
                                    <td className={entry_colors[i]}>{i}</td>
                                    <td className={entry_colors[i]}>
                                        {allocs[i]}
                                    </td>
                                    <td className={entry_colors[i]}>
                                        {valids[i]}
                                    </td>
                                    <td className={entry_colors[i]}>
                                        {addresses[i]}
                                    </td>
                                    <td className={entry_colors[i]}>
                                        {datas[i]}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const subsection_comp = show_subsection ? (
        <div className="flex flex-col gap-y-2">
            {/* MSHR */}
            <div className="section sub-section">
                <h2 className="subsection-header">MSHR</h2>
                <div className="flex flex-row gap-x-1">{mshr_tables}</div>
            </div>

            {/* Prefetch Stream Buffer */}
            <div className="cache-container">
                {Array.from({ length: NUM_PSB }, (_, i) => generate_psb(i))}
            </div>

            {/* Generate Banks Information */}
            <div className="cache-container">
                {Array.from({ length: ICACHE_NUM_BANKS }, (_, i) =>
                    generate_icache_bank(i)
                )}
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">I-Cache</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default React.memo(Icache);
