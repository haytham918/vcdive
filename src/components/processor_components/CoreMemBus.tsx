import { NumberSystem } from "@/app/debugger/page";
import { convert_hex_to_dec, process_values } from "@/lib/utils";
import { useState } from "react";
import { MouseEvent } from "react";
import "./Section.css";
import React from "react";

const CoreMemBus: React.FC<{
    mem_bus_address_data: any;
    mem_bus_command_data: any;
    mem_bus_data_out_data: any;
    mem_bus_req_tag_in_data: any;
    mem_bus_complete_tag_in_data: any;
    mem_bus_data_in_data: any;
    select_number_sys: NumberSystem;
}> = ({
    mem_bus_address_data,
    mem_bus_command_data,
    mem_bus_data_out_data,
    mem_bus_req_tag_in_data,
    mem_bus_complete_tag_in_data,
    mem_bus_data_in_data,
    select_number_sys,
}) => {
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    // Output
    let mem_bus_address = "0".repeat(8);
    let mem_bus_command = "NONE";
    let mem_bus_data_out = "-";

    // Input
    let mem_bus_req_tag_in = 0;
    let mem_bus_complete_tag_in = 0;
    let mem_bus_data_in = "-";

    // Assign values
    if (mem_bus_address_data["CORE.mem_bus_address"]) {
        mem_bus_address = process_values(
            mem_bus_address_data["CORE.mem_bus_address"],
            select_number_sys,
            false,
            false
        );

        const raw_mem_bus_command =
            mem_bus_command_data["CORE.mem_bus_command"];
        console.log(raw_mem_bus_command);
        if (raw_mem_bus_command === "1") {
            mem_bus_command = "LOAD";
        } else if (raw_mem_bus_command === "2") {
            mem_bus_command = "STORE";
        }

        mem_bus_data_out = process_values(
            mem_bus_data_out_data["CORE.mem_bus_data_out.dbbl_level"],
            select_number_sys
        );

        // Input
        mem_bus_req_tag_in =
            convert_hex_to_dec(
                mem_bus_req_tag_in_data["CORE.mem_bus_req_tag_in"]
            ) || 0;
        mem_bus_complete_tag_in =
            convert_hex_to_dec(
                mem_bus_complete_tag_in_data["CORE.mem_bus_complete_tag_in"]
            ) || 0;

        mem_bus_data_in = process_values(
            mem_bus_data_in_data["CORE.mem_bus_data_in.dbbl_level"],
            select_number_sys
        );
    }
    const subsection_comp = show_subsection ? (
        <div className="flex flex-col gap-y-2">
            <div className="section sub-section">
                <h2 className="subsection-header">Input</h2>
                <div className="flex flex-col mt-1 w-[315px] gap-y-1">
                    <p className="smallsection-text font-bold flex flex-row">
                        Memory Bus Request Tag:
                        <span className="ml-auto text-[--color-primary]">
                            {mem_bus_req_tag_in}
                        </span>
                    </p>

                    <p className="smallsection-text font-bold flex flex-row">
                        Memory Bus Complete Tag:
                        <span className="ml-auto text-[--color-primary]">
                            {mem_bus_complete_tag_in}
                        </span>
                    </p>

                    <p className="smallsection-text font-bold flex flex-row">
                        Memory Bus Data In:
                        <span className="ml-auto text-[--color-babyblue]">
                            {mem_bus_data_in}
                        </span>
                    </p>
                </div>
            </div>
            <div className="section sub-section">
                <h2 className="subsection-header">Output</h2>
                <div className="flex flex-col mt-1 w-[315px] gap-y-1">
                    <p className="smallsection-text font-bold flex flex-row">
                        Memory Bus Command:
                        <span className="ml-auto text-[--color-accent]">
                            {mem_bus_command}
                        </span>
                    </p>

                    <p className="smallsection-text font-bold flex flex-row">
                        Memory Bus Address:
                        <span className="ml-auto text-[--color-babyblue]">
                            {mem_bus_address}
                        </span>
                    </p>

                    <p className="smallsection-text font-bold flex flex-row">
                        Memory Bus Data Out:
                        <span className="ml-auto text-[--color-primary]">
                            {mem_bus_data_out}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="section main-section">
            <a onClick={handleHeaderClick}>
                <h1 className="mainsection-header">Core Memory Bus</h1>
            </a>
            {subsection_comp}
        </div>
    );
};

export default React.memo(CoreMemBus);
