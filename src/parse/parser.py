import os
import sys
import polars as pl
import pandas as pd
import json


NAME = "___NAME"

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
                symbol_table[scope_name].update(
                    parse_scope(vcd_file, line.split()[2]))
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
# @return symbol_table: dictionary of the symbol table


def symbol_map(main_table: dict, path="") -> dict:
    symbol_table = dict()
    for scope in main_table:
        if scope:
            if type(main_table[scope]) == dict and NAME in main_table[scope]:
                symbol_table[main_table[scope]['symbol']
                             ] = path + main_table[scope][NAME]
            else:
                symbol_table.update(symbol_map(
                    main_table[scope], path + f"{scope}."))
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
        return {symbol_table[symbol]: data}
    if string[0] in {'0', '1', 'x', 'X', 'z', 'Z'}:
        data = string[0]
        symbol = string[1:].strip()
        return {symbol_table[symbol]: data}
    print("[WARNING]: don't know how to parse line: " + string)
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
                data[current_time_step].update(
                    parse_data_line(line, symbol_table))
    return data


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
    vcd_file = sys.argv[1]
    assert os.path.exists(vcd_file), "File does not exist"
    assert vcd_file.endswith(".vcd"), "File is not a VCD file"

    with open(vcd_file, 'r') as f:
        main_table = parse_definitions(f)
        with open("symbol_table_debug.json", "w") as fout:
            json.dump(main_table, fout, indent=4)
        f.readline()  # Skip the line after $enddefinitions
        symbol_table = symbol_map(main_table)
        data = parse_data(f, symbol_table)

    with open("dump.json", "w") as fout:
        json.dump(data, fout, indent=4)

    df = pd.DataFrame.from_dict(data, orient="index",dtype=str)
    df = (
        pl.from_pandas(df, include_index=True)
        .with_columns(pl.exclude(pl.String).cast(pl.Utf8))
        .rechunk()
        .with_columns(
            pl.when(pl.col(pl.String).str.len_chars() == 0)
            .then(None)
            .otherwise(pl.col(pl.String))
            .name.keep()
        )
        .select(pl.all().forward_fill())
        .rename({"None": "time"})
    )
    df.write_csv("output_filled.csv")
