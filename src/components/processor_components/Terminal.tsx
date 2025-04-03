import { TerminalSettings } from "@/app/debugger/page";
import { Gear, TerminalWindow } from "phosphor-react";
import { MouseEvent, useState } from "react";

const Terminal: React.FC<{
    icache_data: any;
    fetch_data: any;
    decoder_data: any;
    instruction_queue_data: any;
    dispatch_data: any;
    rob_data: any;
    reservation_station_data: any;
    issue_data: any;
    alu_data: any;
    mult_data: any;
    control_data: any;
    ready_list_data: any;
    coordinator_data: any;
    free_list_data: any;
    retire_list_data: any;
    rob_tail_data: any;
    map_table_data: any;
    prf_data: any;
    gshare_data: any;
    gbhr_checkpoint_data: any;
    store_queue_data: any;
    load_buffer_data: any;
    sq_tail_data: any;
    dcache_data: any;
    terminal_settings: TerminalSettings;
    handleOpenDialog: () => void;
}> = ({
    icache_data,
    fetch_data,
    decoder_data,
    instruction_queue_data,
    dispatch_data,
    rob_data,
    reservation_station_data,
    issue_data,
    alu_data,
    mult_data,
    control_data,
    ready_list_data,
    coordinator_data,
    free_list_data,
    retire_list_data,
    rob_tail_data,
    map_table_data,
    prf_data,
    gshare_data,
    gbhr_checkpoint_data,
    store_queue_data,
    load_buffer_data,
    sq_tail_data,
    dcache_data,
    terminal_settings,
    handleOpenDialog,
}) => {
    // Display Terminal
    const [show_terminal, setShowTerminal] = useState(false);
    const hanldeTerminalClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowTerminal(!show_terminal);
    };

    const data_factory = (name: string, is_show: boolean) => {
        // If not show, return nothing
        if (!is_show) return null;
        let data: any;
        switch (name) {
            case "I-Cache": {
                data = icache_data;
                break;
            }
            case "Decoder": {
                data = decoder_data;
                break;
            }
            case "Instruction Queue": {
                data = instruction_queue_data;
                break;
            }
            case "Dispatch": {
                data = dispatch_data;
                break;
            }
            case "Reorder Buffer": {
                data = rob_data;
                break;
            }
            case "Reservation Station": {
                data = reservation_station_data;
                break;
            }
            case "Issue": {
                data = issue_data;
                break;
            }
            case "ALU": {
                data = alu_data;
                break;
            }
            case "MULT": {
                data = mult_data;
                break;
            }
            case "Control": {
                data = control_data;
                break;
            }
            case "Ready List": {
                data = ready_list_data;
                break;
            }
            case "Regfile": {
                data = prf_data;
                break;
            }
            case "BRAT - Coordinator": {
                data = coordinator_data;
                break;
            }
            case "BRAT - Map Table": {
                data = map_table_data;
                break;
            }
            case "BRAT - Free List": {
                data = free_list_data;
                break;
            }
            case "BRAT - ROB Tail": {
                data = rob_tail_data;
                break;
            }
            case "Retire List": {
                data = retire_list_data;
                break;
            }
            case "Gshare": {
                data = gshare_data;
                break;
            }
            case "BRAT - Gshare": {
                data = gbhr_checkpoint_data;
                break;
            }
            case "Load Buffer": {
                data = load_buffer_data;
                break;
            }
            case "Store Queue": {
                data = store_queue_data;
                break;
            }
            case "BRAT - Store Queue": {
                data = sq_tail_data;
                break;
            }
            case "Fetch": {
                data = fetch_data;
                break;
            }
            case "D-Cache": {
                data = dcache_data;
                break;
            }
            default:
                break;
        }
        return data ? (
            <div key={name}>
                <p className="subsection-header mt-4">&gt; {name}</p>
                <div className="individual-data-section">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="flex gap-2 py-1">
                            {/* Display key in one style */}
                            <span className="font-semibol">{key}:</span>
                            {/* Display value in a different color */}
                            <span className="text-[--color-primary]">
                                {String(value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ) : null;
    };

    return (
        <div className="terminal-container">
            {/* Head */}
            <div className="flex items-center gap-x-3">
                <a
                    className="flex flex-row items-center gap-x-2 terminal-header terminal-header-text"
                    onClick={hanldeTerminalClick}
                >
                    Terminal <TerminalWindow size={27} />
                </a>

                <button
                    className="flex flex-row items-center gap-x-1 terminal-header-text"
                    onClick={handleOpenDialog}
                >
                    Setting <Gear size={27} />
                </button>
            </div>

            {/* If terminal is open */}
            {show_terminal ? (
                <div className="terminal-data-section">
                    {Object.entries(terminal_settings).map(([key, value]) =>
                        data_factory(value.label, value.show)
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default Terminal;
