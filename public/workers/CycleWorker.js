const known_modules = [
    "READY_LIST",
    "REORDER_BUFFER",
    "RETIRE_LIST",
    "REGFILE",
    "INSTRUCTION_QUEUE",
    "RESERVATION_STATION",
    "DECODER",
    "ISSUE",
    "DISPATCH",
    "ALU",
    "CONTROL",
    "MULT",
    "LOAD_UNIT",
    "STORE_UNIT",
    "FREE_LIST_BRAT_WORKER",
    "COORDINATOR",
    "MAP_TABLE_BRAT_WORKER",
    "ROB_TAIL_BRAT_WORKER",
    "SQ_TAIL_BRAT_WORKER",
    "LOAD_BUFFER",
    "STORE_QUEUE",
    "GSHARE",
    "GBHR_BRAT_WORKER",
    "ICACHE",
    "DCACHE",
    "FETCH",
    "RETURN_ADDRESS_STACK",
    "RAS_BRAT_WORKER",
    "CORE.mem_bus_address",
    "CORE.mem_bus_command",
    "CORE.mem_bus_data_out",
    "CORE.mem_bus_req_tag_in",
    "CORE.mem_bus_complete_tag_in",
    "CORE.mem_bus_data_in",
];

self.addEventListener("message", (event) => {
    const cycle_data = event.data;
    const groups = {};
    // Group data according to knownModules.
    for (const [key, value] of Object.entries(cycle_data)) {
        for (const module of known_modules) {
            if (key.includes(module)) {
                if (!groups[module]) {
                    groups[module] = [];
                }
                groups[module].push([key, value]);
                break;
            }
        }
    }
    // Send the grouped result back.
    self.postMessage(groups);
});
