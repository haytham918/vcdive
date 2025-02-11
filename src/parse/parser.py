import os
import sys
import json
import time
import gc
from concurrent.futures import ThreadPoolExecutor, as_completed

NAME = "___NAME"
INTERNAL_DELIM = "."
JUNK_TERMS = {"unnamed", "genblk", ".psel", "tmp"}

# Parse the header of the VCD file
# @param vcd_file: file object of the VCD file
# @retun
def parse_definitions(vcd_file) -> dict:
    # Parse the $var section of the VCD file
    # @param line_str: string of the $var section
    # @return line_dict: dictionary of the $var section
    def parse_var(line_str: str) -> dict:
        line_dict = dict()
        line_list = line_str.split()
        line_dict[line_list[4]] = dict()
        line_dict[line_list[4]]['type'] = line_list[1]
        line_dict[line_list[4]]['size'] = line_list[2]
        line_dict[line_list[4]]['symbol'] = line_list[3]
        line_dict[line_list[4]][NAME] = line_list[4]
        if line_list[4] in JUNK_TERMS:
            return {}
        return line_dict

    # Parse the $scope section of the VCD file
    # @param vcd_file: file object of the VCD file
    # @return

    def parse_scope(vcd_file, scope_name: str) -> dict:
        symbol_table = dict()
        symbol_table[scope_name] = dict()
        while True:
            line = vcd_file.readline()
            if line.startswith("$upscope $end"):
                break
            if line.startswith("$scope"):
                symbol_table[scope_name].update(parse_scope(vcd_file, line.split()[2]))
            if line.startswith("$var"):
                symbol_table[scope_name].update(parse_var(line))
        return symbol_table

    main_table = dict()
    while True:
        line = vcd_file.readline()
        if line.startswith("$enddefinitions"):
            break
        if line.startswith("$scope"):
            main_table.update(parse_scope(vcd_file, line.split()[2]))
    return main_table

# Create a symbol table from the main table
# @param main_table: dictionary of the main table
def symbol_map(main_table: dict, path="") -> dict:
    symbol_table = dict()
    for scope in main_table:
        if scope:
            if type(main_table[scope]) == dict and NAME in main_table[scope]:
                symbol_table[main_table[scope]['symbol']] = path + main_table[scope][NAME]
            else:
                symbol_table.update(symbol_map(main_table[scope], path + f"{scope}{INTERNAL_DELIM}"))
    return symbol_table

# Parse a line of data from the VCD file
# @param string: string of the line
# @param symbol_table: dictionary of the symbol table
# @return data: dictionary of the data {symbol : data}
def parse_data_line(string: str, symbol_table: dict) -> dict:
    if len(string) == 0:
        return {}
    
    if string[0] == 'b' or string[0] == 'B':
        data = string.split()[0][1:]
        symbol = string.split()[1].strip()
        if 'x' in data or 'z' in data: # optimization
            return {symbol_table[symbol]: -1}
        return {symbol_table[symbol]: int(data, 2)}
    if string[0] in {'x', 'X'}: # optimization
        symbol = string[1:].strip()
        return {symbol_table[symbol]: -1}
    if string[0] in {'0', '1', 'x', 'X', 'z', 'Z'}:
        data = string[0]
        symbol = string[1:].strip()
        return {symbol_table[symbol]: data}
   #  print("[WARNING]: don't know how to parse line: " + string)
    return {}


# Parse the data section of the VCD file
# @param vcd_file: file object of the VCD file
# @param symbol_table: dictionary of the symbol table
# @return data: dictionary of the data {time_step : {symbol : data, ...}, ...}
def parse_data(vcd_file: str, symbol_table: dict) -> dict:
    data = dict()
    current_time_step = 0
    data[current_time_step] = dict()
    while f.readable():
        while True:
            line = vcd_file.readline()
            if line == "":
                return data
            if line.startswith("#"):
                current_time_step = int(line[1:])
                data[current_time_step] = dict()
            elif line.startswith("$end"):
                break
            else:
                line_data = parse_data_line(line, symbol_table)
                for name in line_data:
                    data[current_time_step][name] = line_data[name]
    return data

def fill_missing_rows(data: dict) -> dict:
    sorted_keys = sorted(data.keys(), key=lambda k: int(k))
    for i in range(1, len(sorted_keys)):
        if i % 999 == 0:
            gc.collect()

        prev_row = data[sorted_keys[i - 1]]
        current_row = data[sorted_keys[i]]
        filled_row = prev_row.copy()
        filled_row.update(current_row)
        data[sorted_keys[i]] = filled_row
    return data
   
def make_hierarchical(flat_dict):
    nested_dict = {}
    for key, value in flat_dict.items():
        keys = key.split('.')
        d = nested_dict
        for part in keys[:-1]:
            d = d.setdefault(part, {})
        d[keys[-1]] = value
    return nested_dict


'''
This parser works for VCD files and VPD that have been converted to VCD

1 ) To generate a VPD:

    Add to testbench code:
    $vcdplusfile("../cpu.vpd");
    $vcdpluson;

2) Add alias to bash profile:

    alias vpd2vcd='/opt/caen/synopsys/vcs-2023.12-SP2-1/bin/vpd2vcd +splitpacked'

3) Add exports:

    export VCS_HOME=/opt/caen/synopsys/vcs-2023.12-SP2-1
    export PATH=$VCS_HOME/bin:$PATH

4) Convert the VPD to VCD:

    vpd2vcd cpu.vpd cpu2.vcd

5) Run the parser:

    python3 src/parse/parser.py inputs/p3_cpu_vpd.vcd

'''
if __name__ == "__main__":
    vcd_file = 'inputs/bfsvpd.vcd'
    assert os.path.exists(vcd_file), "File does not exist"
    assert vcd_file.endswith(".vcd"), "File is not a VCD file"
    current_time = time.time()


    with open(vcd_file, 'r') as f:
        print("Reading Headers ", end="")
        
        main_table = parse_definitions(f)
        print(time.time() - current_time)
        current_time = time.time()
        
        f.readline()  # Skip the line after $enddefinitions
        print("Generating Symbol Table ", end="")
        symbol_table = symbol_map(main_table)

        print(time.time() - current_time)
        current_time = time.time()
        print("Parsing Data ", end="")

        optimized_table = dict()
        i = 0
        for k in symbol_table:
            optimized_table[k] = i
            i += 1
        data = parse_data(f, optimized_table)
        print(time.time() - current_time)
        current_time = time.time()
    
    print("Filling Missing Rows", end="")
    data = fill_missing_rows(data)
    print(time.time() - current_time)
    current_time = time.time()
    print("Done")

    # with open("symbol_table_debug.json", "w") as fout:
    #     json.dump(main_table, fout, indent=4)
