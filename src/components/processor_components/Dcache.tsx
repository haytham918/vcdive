import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css";
import { convert_hex_to_dec, process_values, segment_idx } from "@/lib/utils";
import { NumberSystem } from "@/app/debugger/page";
import React from "react";
let DCACHE_NUM_BANKS = 2; // Number of BANKS
let DCACHE_NUM_SETS = 4; // Number of Sets per Bank
let DCACHE_NUM_WAYS = 4; // Number of Ways per Set
let DCACHE_BANK_ENTRY_SIZE = 16; // Number of Cachelines per Bank
const MSHR_SEGMENT_SIZE = 8; // SEGMENT SIZE for MSHR
let MSHR_SIZE = 16; // Size of MSHR
let WRITE_BUFFER_SIZE = 8; // Size of Write Buffer
const WRITE_BUFFER_SEGMENT_SIZE = 4; // Segment Size
let WRITE_BUFFER_READ_PORT_SIZE = 2;
let WRITE_BUFFER_WRITE_PORT_SIZE = 2;
const Dcache: React.FC<{
    select_number_sys: NumberSystem;
    dcache_data: any;
}> = ({ select_number_sys, dcache_data }) => {
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Set parametes
    if (dcache_data["DCACHE.NUM_BANKS"]) {
        DCACHE_NUM_BANKS = convert_hex_to_dec(dcache_data["DCACHE.NUM_BANKS"]);
        DCACHE_NUM_SETS = convert_hex_to_dec(
            dcache_data["DCACHE.NUM_SETS_PER_BANK"]
        );
        DCACHE_NUM_WAYS = convert_hex_to_dec(
            dcache_data["DCACHE.ASSOCIATIVITY"]
        );
        DCACHE_BANK_ENTRY_SIZE = DCACHE_NUM_SETS * DCACHE_NUM_WAYS;
    }

    // Function to generate each bank's information
    const generate_dcache_bank = (bank_index: number) => {
        const set_nums: (string | number)[] = Array(
            DCACHE_BANK_ENTRY_SIZE
        ).fill("");
        const way_nums: (string | number)[] = Array(
            DCACHE_BANK_ENTRY_SIZE
        ).fill("");
        const valids: string[] = Array(DCACHE_BANK_ENTRY_SIZE).fill("0");
        const is_hands: string[] = Array(DCACHE_BANK_ENTRY_SIZE).fill("");
        const refs: string[] = Array(DCACHE_BANK_ENTRY_SIZE).fill("-");
        const tags: string[] = Array(DCACHE_BANK_ENTRY_SIZE).fill("-");
        const datas: string[] = Array(DCACHE_BANK_ENTRY_SIZE).fill("-");
        const colors: string[] = Array(DCACHE_BANK_ENTRY_SIZE).fill("");

        // Check if eviction enabled
        let is_evict = false;
        if (dcache_data["DCACHE.m_evict_en"]) {
            is_evict =
                dcache_data["DCACHE.m_evict_en"][
                    DCACHE_NUM_BANKS - 1 - bank_index
                ] === "1";
        }

        const eviction_opacity = is_evict ? "opacity-100" : "opacity-15";

        // Check if read request valid and what
        let read_granted = false;
        let read_address = "0".repeat(8);
        let write_granted = false;
        let write_address = "0".repeat(8);
        if (dcache_data["DCACHE.m_lsq_read_request_granted"]) {
            read_granted =
                dcache_data["DCACHE.m_lsq_read_request_granted"][
                    DCACHE_NUM_BANKS - 1 - bank_index
                ] === "1";

            if (read_granted) {
                read_address = process_values(
                    dcache_data[
                        `DCACHE.m_lsq_read_request_address[${bank_index}]`
                    ],
                    select_number_sys,
                    false,
                    false
                );
            }

            write_granted =
                dcache_data["DCACHE.m_lsq_write_request_granted"][
                    DCACHE_NUM_BANKS - 1 - bank_index
                ] === "1";

            if (write_granted) {
                write_address = process_values(
                    dcache_data[
                        `DCACHE.m_lsq_write_request_address[${bank_index}]`
                    ],
                    select_number_sys,
                    false,
                    false
                );
            }
        }
        const write_opacity = write_granted ? "opacity-100" : "opacity-15";
        const read_opacity = read_granted ? "opacity-100" : "opacity-15";

        // Check each data val
        for (let i = 0; i < DCACHE_BANK_ENTRY_SIZE; i++) {
            const set = Math.floor(i / DCACHE_NUM_WAYS); // Get the set index
            const way = i % DCACHE_NUM_WAYS; // Get the way index

            // Set the set index if way === 0
            if (way === 0) {
                set_nums[i] = set;
            }
            way_nums[i] = way;

            // Set color
            colors[i] = `set${set}`;
            valids[i] =
                dcache_data[
                    `DCACHE.gen_cache[${bank_index}].DCACHE_BANK.memdp_metadata[${set}][${way}].valid`
                ];

            // Get hand val
            const set_hand = convert_hex_to_dec(
                dcache_data[
                    `DCACHE.gen_cache[${bank_index}].EVICTION_POLICY.clock_queues[${set}].hand`
                ]
            );
            if (set_hand == way) {
                is_hands[i] = "h";
            }

            // Set other values if it's valid
            if (valids[i] === "1") {
                // Get referenced
                refs[i] =
                    dcache_data[
                        `DCACHE.gen_cache[${bank_index}].EVICTION_POLICY.clock_queues[${set}].referenced`
                    ][DCACHE_NUM_WAYS - 1 - way];

                // Get tag
                const raw_tag =
                    dcache_data[
                        `DCACHE.gen_cache[${bank_index}].DCACHE_BANK.memdp_metadata[${set}][${way}].tag`
                    ];
                tags[i] = parseInt(raw_tag, 2).toString(2);

                // Get actual data
                datas[i] = process_values(
                    dcache_data[
                        `DCACHE.gen_cache[${bank_index}].DCACHE_BANK.gen_memdp[${way}].memdp_per_way.memData[${set}]`
                    ],
                    select_number_sys
                );
            }
        }
        return (
            <div className="section sub-section" key={bank_index}>
                <h2 className="subsection-header">Bank {bank_index}</h2>
                <div className="mb-2 flex flex-row w-[100%] ml-4 gap-x-4">
                    <div
                        className={`section inner-section ${eviction_opacity} h-[max-content]`}
                    >
                        <p className="smallsection-text flex flex-row">
                            Evict En:
                            <span className="font-bold ml-2 text-[--color-primary]">
                                {is_evict ? "1" : "0"}
                            </span>
                        </p>
                    </div>

                    <div>
                        <div
                            className={`section inner-section ${read_opacity}`}
                        >
                            <p className="smallsection-text w-[11rem] flex flex-row">
                                Read Addr:
                                <span className="font-bold ml-auto text-[--color-babyblue]">
                                    {read_address}
                                </span>
                            </p>
                        </div>

                        <div
                            className={`section inner-section ${write_opacity}`}
                        >
                            <p className="smallsection-text w-[11rem] flex flex-row">
                                Write Addr:
                                <span className="font-bold ml-auto text-[--color-babyblue]">
                                    {write_address}
                                </span>
                            </p>
                        </div>
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
                            { length: DCACHE_BANK_ENTRY_SIZE },
                            (_, i) => (
                                <tr key={i}>
                                    <td className={colors[i]}>{set_nums[i]}</td>

                                    <td className={colors[i]}>{way_nums[i]}</td>

                                    <td className={colors[i]}>{valids[i]}</td>

                                    <td className={colors[i]}>{is_hands[i]}</td>

                                    <td className={colors[i]}>{refs[i]}</td>

                                    <td className={colors[i]}>{tags[i]}</td>

                                    <td className={colors[i]}>{datas[i]}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    // MSHR, set the size
    if (dcache_data["DCACHE.MSHR_TABLE.NUM_MSHR_UNITS"]) {
        MSHR_SIZE = convert_hex_to_dec(
            dcache_data["DCACHE.MSHR_TABLE.NUM_MSHR_UNITS"]
        );
    }

    // Get the MSHR entry information
    const mshr_valids: string[] = Array(MSHR_SIZE).fill("");
    const mshr_base_addrs: (string | number)[] = Array(MSHR_SIZE).fill("-");
    const mshr_valid_masks: string[] = Array(MSHR_SIZE).fill("-");
    const mshr_datas: (string | number)[] = Array(MSHR_SIZE).fill("-");
    const mshr_colors: string[] = Array(MSHR_SIZE).fill("");
    // set values
    if (dcache_data["DCACHE.MSHR_TABLE.mshr_table[0].valid"]) {
        for (let i = 0; i < MSHR_SIZE; i++) {
            // Get valid bit
            mshr_valids[i] =
                dcache_data[`DCACHE.MSHR_TABLE.mshr_table[${i}].valid`];

            // set other info if valid
            if (mshr_valids[i] === "1") {
                mshr_base_addrs[i] = process_values(
                    dcache_data[
                        `DCACHE.MSHR_TABLE.mshr_table[${i}].base_address`
                    ],
                    select_number_sys,
                    false,
                    false
                );
                mshr_valid_masks[i] =
                    dcache_data[
                        `DCACHE.MSHR_TABLE.mshr_table[${i}].valid_mask`
                    ];
                mshr_datas[i] = process_values(
                    dcache_data[
                        `DCACHE.MSHR_TABLE.mshr_table[${i}].data.dbbl_level`
                    ],
                    select_number_sys
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
                        <th>Valid_Mask</th>
                        <th>Data</th>
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
                                <td className={mshr_colors[actual_index]}>
                                    {mshr_valid_masks[actual_index]}
                                </td>
                                <td className={mshr_colors[actual_index]}>
                                    {mshr_datas[actual_index]}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )
    );

    // Write Buffer --------------------------------------------------------
    if (dcache_data["DCACHE.WRITE_BUFFER.SIZE"]) {
        WRITE_BUFFER_SIZE = convert_hex_to_dec(
            dcache_data["DCACHE.WRITE_BUFFER.SIZE"]
        );
        WRITE_BUFFER_READ_PORT_SIZE = convert_hex_to_dec(
            dcache_data["DCACHE.WRITE_BUFFER.READ_PORTS"]
        );
        WRITE_BUFFER_WRITE_PORT_SIZE = convert_hex_to_dec(
            dcache_data["DCACHE.WRITE_BUFFER.WRITE_PORTS"]
        );
    }
    const write_buffer_valids: string[] = Array(WRITE_BUFFER_SIZE).fill("0");
    const write_buffer_addrs: string[] = Array(WRITE_BUFFER_SIZE).fill("-");
    const write_buffer_datas: string[] = Array(WRITE_BUFFER_SIZE).fill("-");
    const write_buffer_colors: string[] = Array(WRITE_BUFFER_SIZE).fill("");
    if (dcache_data["DCACHE.WRITE_BUFFER.SIZE"]) {
        for (let i = 0; i < WRITE_BUFFER_SIZE; i++) {
            write_buffer_valids[i] =
                dcache_data[`DCACHE.WRITE_BUFFER.write_buffer[${i}].valid`];
            // If is valid
            if (write_buffer_valids[i] === "1") {
                write_buffer_colors[i] = "cyan";
                write_buffer_addrs[i] = process_values(
                    dcache_data[`DCACHE.WRITE_BUFFER.write_buffer[${i}].addr`],
                    select_number_sys,
                    false,
                    false
                );
                write_buffer_datas[i] = process_values(
                    dcache_data[`DCACHE.WRITE_BUFFER.write_buffer[${i}].data`],
                    select_number_sys
                );
            }
        }
    }

    // Read and Write Ports
    const write_buffer_read_request_ens: string[] = Array(
        WRITE_BUFFER_READ_PORT_SIZE
    ).fill("0");
    const write_buffer_read_request_addrs: string[] = Array(
        WRITE_BUFFER_READ_PORT_SIZE
    ).fill("-");
    const write_buffer_read_request_datas: string[] = Array(
        WRITE_BUFFER_READ_PORT_SIZE
    ).fill("-");
    const write_buffer_read_request_gnts: string[] = Array(
        WRITE_BUFFER_READ_PORT_SIZE
    ).fill("-");
    const write_buffer_read_request_colors: string[] = Array(
        WRITE_BUFFER_READ_PORT_SIZE
    ).fill("");
    if (dcache_data["DCACHE.WRITE_BUFFER.READ_PORTS"]) {
        for (let i = 0; i < WRITE_BUFFER_READ_PORT_SIZE; i++) {
            write_buffer_read_request_ens[i] =
                dcache_data[`DCACHE.WRITE_BUFFER.read_request_valid`][
                    WRITE_BUFFER_READ_PORT_SIZE - 1 - i
                ];
            // If read enable
            if (write_buffer_read_request_ens[i] === "1") {
                // Get gnt
                write_buffer_read_request_gnts[i] =
                    dcache_data[`DCACHE.WRITE_BUFFER.read_data_valid`][
                        WRITE_BUFFER_READ_PORT_SIZE - i - 1
                    ];

                // If granted
                if (write_buffer_read_request_gnts[i] === "1") {
                    write_buffer_read_request_colors[i] = "emerald";
                } else {
                    write_buffer_read_request_colors[i] = "yellow";
                }

                // Get address and data
                write_buffer_read_request_addrs[i] = process_values(
                    dcache_data[
                        `DCACHE.WRITE_BUFFER.read_request_addresses[${i}]`
                    ],
                    select_number_sys,
                    false,
                    false
                );

                write_buffer_read_request_datas[i] = process_values(
                    dcache_data[
                        `DCACHE.WRITE_BUFFER.read_data[${i}].dbbl_level`
                    ],
                    select_number_sys
                );
            }
        }
    }

    console.log(write_buffer_read_request_ens[0]);

    const write_buffer_write_forward_ens: string[] = Array(
        WRITE_BUFFER_WRITE_PORT_SIZE
    ).fill("0");
    const write_buffer_write_forward_request_sizes: (string | number)[] = Array(
        WRITE_BUFFER_WRITE_PORT_SIZE
    ).fill("-");
    const write_buffer_write_forward_addrs: string[] = Array(
        WRITE_BUFFER_WRITE_PORT_SIZE
    ).fill("-");
    const write_buffer_write_forward_datas: string[] = Array(
        WRITE_BUFFER_WRITE_PORT_SIZE
    ).fill("-");
    const write_buffer_write_forward_gnts: string[] = Array(
        WRITE_BUFFER_WRITE_PORT_SIZE
    ).fill("-");
    const write_buffer_write_forward_colors: string[] = Array(
        WRITE_BUFFER_WRITE_PORT_SIZE
    ).fill("");
    if (dcache_data["DCACHE.WRITE_BUFFER.WRITE_PORTS"]) {
        for (let i = 0; i < WRITE_BUFFER_WRITE_PORT_SIZE; i++) {
            write_buffer_write_forward_ens[i] =
                dcache_data[`DCACHE.WRITE_BUFFER.write_request_valid`][
                    WRITE_BUFFER_WRITE_PORT_SIZE - 1 - i
                ];
            // If read enable
            if (write_buffer_write_forward_ens[i] === "1") {
                // Get gnt
                write_buffer_write_forward_gnts[i] =
                    dcache_data[`DCACHE.WRITE_BUFFER.write_granted`][
                        WRITE_BUFFER_WRITE_PORT_SIZE - i - 1
                    ];

                // If granted
                if (write_buffer_write_forward_gnts[i] === "1") {
                    write_buffer_write_forward_colors[i] = "emerald";
                } else {
                    write_buffer_write_forward_colors[i] = "yellow";
                }

                // Get size, address and data
                write_buffer_write_forward_addrs[i] = process_values(
                    dcache_data[
                        `DCACHE.WRITE_BUFFER.write_request_address[${i}]`
                    ],
                    select_number_sys,
                    false,
                    false
                );

                write_buffer_write_forward_request_sizes[i] =
                    convert_hex_to_dec(
                        dcache_data[
                            `DCACHE.WRITE_BUFFER.write_request_sizes[${i}]`
                        ]
                    );

                write_buffer_write_forward_datas[i] = process_values(
                    dcache_data[
                        `DCACHE.WRITE_BUFFER.write_request_data[${i}].dbbl_level`
                    ],
                    select_number_sys
                );
            }
        }
    }

    const WRITE_BUFFER_INDEX_SEGMENTS = segment_idx(
        WRITE_BUFFER_SEGMENT_SIZE,
        WRITE_BUFFER_SIZE
    );
    const write_buffer_tables = WRITE_BUFFER_INDEX_SEGMENTS.map(
        (segment, segment_idx) => (
            <table key={segment_idx} className="write-buffer-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Valid</th>
                        <th>Mem_Addr</th>
                        <th>Data</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.from(
                        { length: WRITE_BUFFER_SEGMENT_SIZE },
                        (_, i) => {
                            const actual_index =
                                segment_idx * WRITE_BUFFER_SEGMENT_SIZE + i;
                            return (
                                <tr key={i}>
                                    <td
                                        className={
                                            write_buffer_colors[actual_index]
                                        }
                                    >
                                        {actual_index}
                                    </td>
                                    <td
                                        className={
                                            write_buffer_colors[actual_index]
                                        }
                                    >
                                        {write_buffer_valids[actual_index]}
                                    </td>
                                    <td
                                        className={
                                            write_buffer_colors[actual_index]
                                        }
                                    >
                                        {write_buffer_addrs[actual_index]}
                                    </td>
                                    <td
                                        className={
                                            write_buffer_colors[actual_index]
                                        }
                                    >
                                        {write_buffer_datas[actual_index]}
                                    </td>
                                </tr>
                            );
                        }
                    )}
                </tbody>
            </table>
        )
    );

    const write_buffer_comp = (
        <div className="flex flex-col w-[100%] gap-y-1">
            <div className="grid inner-section grid-cols-2 partial-info-section">
                {/* Read Ports */}
                <div className="flex flex-col items-center">
                    <h3 className="smallsection-text font-bold mb-2">
                        Read Ports
                    </h3>
                    <table className="write-buffer-ports-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>En</th>
                                <th>Gnt</th>
                                <th>Read_Addr</th>
                                <th>Data</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from(
                                { length: WRITE_BUFFER_READ_PORT_SIZE },
                                (_, i) => (
                                    <tr key={i}>
                                        <td
                                            className={
                                                write_buffer_read_request_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {i}
                                        </td>
                                        <td
                                            className={
                                                write_buffer_read_request_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {write_buffer_read_request_ens[i]}
                                        </td>
                                        <td
                                            className={
                                                write_buffer_read_request_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {write_buffer_read_request_gnts[i]}
                                        </td>
                                        <td
                                            className={
                                                write_buffer_read_request_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {write_buffer_read_request_addrs[i]}
                                        </td>
                                        <td
                                            className={
                                                write_buffer_read_request_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {write_buffer_read_request_datas[i]}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Write Ports */}
                <div className="flex flex-col items-center">
                    <h3 className="smallsection-text font-bold mb-2">
                        Write Ports
                    </h3>
                    <table className="write-buffer-ports-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>En</th>
                                <th>Gnt</th>
                                <th>Size</th>
                                <th>Write_Addr</th>
                                <th>Data</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from(
                                { length: WRITE_BUFFER_WRITE_PORT_SIZE },
                                (_, i) => (
                                    <tr key={i}>
                                        <td
                                            className={
                                                write_buffer_write_forward_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {i}
                                        </td>
                                        <td
                                            className={
                                                write_buffer_write_forward_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {write_buffer_write_forward_ens[i]}
                                        </td>

                                        <td
                                            className={
                                                write_buffer_write_forward_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {write_buffer_write_forward_gnts[i]}
                                        </td>

                                        <td
                                            className={
                                                write_buffer_write_forward_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {
                                                write_buffer_write_forward_request_sizes[
                                                    i
                                                ]
                                            }
                                        </td>

                                        <td
                                            className={
                                                write_buffer_write_forward_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {
                                                write_buffer_write_forward_addrs[
                                                    i
                                                ]
                                            }
                                        </td>

                                        <td
                                            className={
                                                write_buffer_write_forward_colors[
                                                    i
                                                ]
                                            }
                                        >
                                            {
                                                write_buffer_write_forward_datas[
                                                    i
                                                ]
                                            }
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="inner-section section">
                <h3 className="smallsection-text font-bold mb-2">Buffer</h3>
                <div className="grid grid-cols-2 gap-3">
                    {write_buffer_tables}
                </div>
            </div>
        </div>
    );

    // Component
    const subsection_comp = show_subsection ? (
        <div className="flex flex-col gap-y-2">
            {/* MSHR */}
            <div className="section sub-section">
                <h2 className="subsection-header">MSHR</h2>
                <div className="flex flex-row gap-x-1">{mshr_tables}</div>
            </div>

            {/* Write Buffer */}
            <div className="section sub-section">
                <h2 className="subsection-header">Write Buffer</h2>
                {write_buffer_comp}
            </div>

            {/* Generate Banks Information */}
            <div className="cache-container">
                {Array.from({ length: DCACHE_NUM_BANKS }, (_, i) =>
                    generate_dcache_bank(i)
                )}
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">D-Cache</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default React.memo(Dcache);
