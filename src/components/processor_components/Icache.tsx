import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css";
import { convert_hex_to_dec, process_values, segment_idx } from "@/lib/utils";
import { NumberSystem } from "@/app/debugger/page";

let ICACHE_NUM_BANKS = 2; // Number of BANKS
let ICACHE_NUM_SETS = 4; // Number of Sets per Bank
let ICACHE_NUM_WAYS = 4; // Number of Ways per Set
let ICACHE_BANK_ENTRY_SIZE = 16; // Number of Cachelines per Bank
const MSHR_SEGMENT_SIZE = 8; // SEGMENT SIZE for MSHR
let MSHR_SIZE = 16; // Size of MSHR
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
        ICACHE_NUM_SETS = convert_hex_to_dec(icache_data["ICACHE.NUM_SETS"]);
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
        const datas: string[] = Array(ICACHE_BANK_ENTRY_SIZE).fill("-");
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

        // Check each data val
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
            const set_hand = convert_hex_to_dec(
                icache_data[
                    `ICACHE.gen_cache[${bank_index}].EVICTION_POLICY.clock_queues[${set}].hand`
                ]
            );
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
                tags[i] = process_values(
                    icache_data[
                        `ICACHE.gen_cache[${bank_index}].ICACHE_BANK.memdp_metadata[${set}][${way}].tag`
                    ],
                    select_number_sys
                );

                // Get actual data
                datas[i] = process_values(
                    icache_data[
                        `ICACHE.gen_cache[${bank_index}].ICACHE_BANK.gen_memdp[${way}].memdp_per_way.memData[${set}]`
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
                        className={`section inner-section ${eviction_opacity}`}
                    >
                        <p className="smallsection-text flex flex-row">
                            Eviction En:
                            <span className="font-bold ml-2 text-[--color-primary]">
                                {is_evict ? "1" : "0"}
                            </span>
                        </p>
                    </div>

                    <div className={`section inner-section ${read_opacity}`}>
                        <p className="smallsection-text w-[12rem] flex flex-row">
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
    if (icache_data["ICACHE.MSHR_TABLE.NUM_MSHR_UNITS"]) {
        MSHR_SIZE = convert_hex_to_dec(
            icache_data["ICACHE.MSHR_TABLE.NUM_MSHR_UNITS"]
        );
    }

    // Get the MSHR entry information
    const mshr_valids: string[] = Array(MSHR_SIZE).fill("");
    const mshr_base_addrs: (string | number)[] = Array(MSHR_SIZE).fill("-");
    const mshr_valid_masks: string[] = Array(MSHR_SIZE).fill("-");
    const mshr_datas: (string | number)[] = Array(MSHR_SIZE).fill("-");
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
                mshr_valid_masks[i] =
                    icache_data[
                        `ICACHE.MSHR_TABLE.mshr_table[${i}].valid_mask`
                    ];
                mshr_datas[i] = process_values(
                    icache_data[
                        `ICACHE.MSHR_TABLE.mshr_table[${i}].data.dbbl_level`
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

    const subsection_comp = show_subsection ? (
        <div className="flex flex-col gap-y-2">
            <div className="section sub-section">
                <h2 className="subsection-header">MSHR</h2>
                <div className="flex flex-row gap-x-1">{mshr_tables}</div>
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

export default Icache;
