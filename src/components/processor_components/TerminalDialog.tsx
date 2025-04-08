import { TerminalSettings } from "@/app/debugger/page";
import { XSquare } from "phosphor-react";
import React from "react";
const TerminalDialog: React.FC<{
    show_dialog: boolean;
    handleCloseDialog: () => void;
    terminal_settings: TerminalSettings;
    handleTerminalSettings: (module: string, set_value: boolean) => void;
}> = ({
    show_dialog,
    handleCloseDialog,
    terminal_settings,
    handleTerminalSettings,
}) => {
    // If dialog now displaying

    const handleCheck = (
        event: React.ChangeEvent<HTMLInputElement>,
        module: string
    ) => {
        handleTerminalSettings(module, event.target.checked);
    };
    return (
        <div
            className={!show_dialog ? "hidden" : "modal"}
            onClick={handleCloseDialog}
        >
            <div
                className="dialog-box relative"
                onClick={(e) => e.stopPropagation()}
            >
                <a className="ml-auto" onClick={handleCloseDialog}>
                    <XSquare size={35} />
                </a>
                <h2 className="dialog-text dialog-header">
                    Data to Include for Terminal
                </h2>
                <div className="checkbox-container dialog-text">
                    <div className="checkbox-subcontainer">
                        {/* I-Cache */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.icache.show}
                                onChange={(e) => handleCheck(e, "icache")}
                            />
                            I-Cache
                        </span>

                        {/* Fetch */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.fetch.show}
                                onChange={(e) => handleCheck(e, "fetch")}
                            />
                            Fetch
                        </span>

                        {/* Gshare */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.gshare.show}
                                onChange={(e) => handleCheck(e, "gshare")}
                            />
                            Gshare
                        </span>

                        {/* Decoder */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.decoder.show}
                                onChange={(e) => handleCheck(e, "decoder")}
                            />
                            Decoder
                        </span>

                        {/* IQ */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={
                                    terminal_settings.instruction_queue.show
                                }
                                onChange={(e) =>
                                    handleCheck(e, "instruction_queue")
                                }
                            />
                            Instruction Queue
                        </span>

                        {/* Dispatch */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.dispatch.show}
                                onChange={(e) => handleCheck(e, "dispatch")}
                            />
                            Dispatch
                        </span>

                        {/* ROB */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.rob.show}
                                onChange={(e) => handleCheck(e, "rob")}
                            />
                            Reorder Buffer
                        </span>
                    </div>

                    <div className="checkbox-subcontainer">
                        {/* Reservation Station */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.rs.show}
                                onChange={(e) => handleCheck(e, "rs")}
                            />
                            Reservation Station
                        </span>

                        {/* Issue */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.issue.show}
                                onChange={(e) => handleCheck(e, "issue")}
                            />
                            Issue
                        </span>

                        {/* ALU */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.alu.show}
                                onChange={(e) => handleCheck(e, "alu")}
                            />
                            ALU
                        </span>

                        {/* MULT */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.mult.show}
                                onChange={(e) => handleCheck(e, "mult")}
                            />
                            MULT
                        </span>

                        {/* Load Unit */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.load.show}
                                onChange={(e) => handleCheck(e, "load")}
                            />
                            Load Unit
                        </span>

                        {/* Store Unit */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.store.show}
                                onChange={(e) => handleCheck(e, "store")}
                            />
                            Store Unit
                        </span>

                        {/* Control */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.control.show}
                                onChange={(e) => handleCheck(e, "control")}
                            />
                            Control
                        </span>
                    </div>

                    <div className="checkbox-subcontainer">
                        {/* RAS */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.ras.show}
                                onChange={(e) => handleCheck(e, "ras")}
                            />
                            RAS
                        </span>

                        {/* Regfile */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.regfile.show}
                                onChange={(e) => handleCheck(e, "regfile")}
                            />
                            Regfile
                        </span>

                        {/* Ready List */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.ready_list.show}
                                onChange={(e) => handleCheck(e, "ready_list")}
                            />
                            Ready List
                        </span>

                        {/* Retire List */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.retire_list.show}
                                onChange={(e) => handleCheck(e, "retire_list")}
                            />
                            Retire List
                        </span>

                        {/* Load Buffer */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.load_buffer.show}
                                onChange={(e) => handleCheck(e, "load_buffer")}
                            />
                            Load Buffer
                        </span>

                        {/* Store Queue */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.store_queue.show}
                                onChange={(e) => handleCheck(e, "store_queue")}
                            />
                            Store Queue
                        </span>

                        {/* DCache */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.dcache.show}
                                onChange={(e) => handleCheck(e, "dcache")}
                            />
                            D-Cache
                        </span>
                    </div>

                    <div className="checkbox-subcontainer">
                        {/* BRAT Coordinator */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.coordinator.show}
                                onChange={(e) => handleCheck(e, "coordinator")}
                            />
                            BRAT - Coordinator
                        </span>

                        {/* BRAT - ROB Tail */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.rob_tail.show}
                                onChange={(e) => handleCheck(e, "rob_tail")}
                            />
                            BRAT - ROB Tail
                        </span>

                        {/* BRAT - Store Queue */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={
                                    terminal_settings.brat_store_queue.show
                                }
                                onChange={(e) =>
                                    handleCheck(e, "brat_store_queue")
                                }
                            />
                            BRAT - Store Queue
                        </span>

                        {/* BRAT - Gshare */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.brat_gshare.show}
                                onChange={(e) => handleCheck(e, "brat_gshare")}
                            />
                            BRAT - Gshare
                        </span>

                        {/* BRAT - RAS */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.brat_ras.show}
                                onChange={(e) => handleCheck(e, "brat_ras")}
                            />
                            BRAT - RAS
                        </span>

                        {/* BRAT-Map Table */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.map_table.show}
                                onChange={(e) => handleCheck(e, "map_table")}
                            />
                            BRAT - Map Table
                        </span>

                        {/* BRAT - Free List */}
                        <span className="checkbox-item">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={terminal_settings.free_list.show}
                                onChange={(e) => handleCheck(e, "free_list")}
                            />
                            BRAT - Free List
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TerminalDialog);
