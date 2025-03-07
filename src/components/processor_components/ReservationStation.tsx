"use client";
import "./Section.css";
import { MouseEvent, useState } from "react";
import {
  parse_instruction,
  convert_reg_hex_to_dec,
  hexStringToNumber,
  hexStringToMask,
  reverseStr,
} from "@/lib/utils";

// TODO: Make this a config file parameter
const RS_SIZE = 8;
const RS_PREFIX = "RS";

const BRANCH_MASK_LENGTH = 4;

enum RsView {
  ASM = 0,
  HEX,
  BINARY,
  __LENGTH,
}

// Convert RsView to string
const RsViewToString = (view_mode: RsView) => {
  switch (view_mode) {
    case RsView.ASM:
      return "ASM";
    case RsView.HEX:
      return "HEX";
    case RsView.BINARY:
      return "BIN";
    default:
      return "Invalid";
  }
};

const ReservationStation: React.FC<{ rs_data: any; ready_list_data: any }> = ({
  rs_data,
  ready_list_data,
}) => {
  const [show_subsection, setShowSubsection] = useState(true);
  const [view_mode, setViewMode] = useState(RsView.ASM);

  const handleHeaderClick = (event: MouseEvent) => {
    event.preventDefault();
    setShowSubsection(!show_subsection);
  };

  const handleViewModeChange = (event: MouseEvent) => {
    event.preventDefault();
    setViewMode((view_mode + 1) % RsView.__LENGTH);
  };

  interface RsEntry {
    valid: boolean;
    destination_tag: number;
    t1: number;
    t2: number;
    imm: number;
    // TODO: Parse `dest_fu` into an actual function unit, once that is determined
    dest_fu_type: number; // Represents a bit-vector of length NUM_FU_TYPES_BITS
    is_imm: boolean;
    branch_mask: string;
  }

  const ready_state_mask_bigendian: string =
    ready_list_data["READY_LIST.ready_state_mask"] === undefined
      ? ""
      : ready_list_data["READY_LIST.ready_state_mask"];
  const ready_state_mask: string = reverseStr(ready_state_mask_bigendian);

  const isReady = (reg: number): boolean => {
    return ready_state_mask[reg] === "1";
  }

  const parseRsEntry = (rs_data: any, index: number): RsEntry => {
    const key_prefix = `${RS_PREFIX}.rs_data[${index}]`;

    const valueAt = (key: string) => {
      return rs_data[`${key_prefix}.${key}`];
    };

    const valueAtNumber = (key: string) => {
      return hexStringToNumber(valueAt(key));
    };

    const valid = valueAt("valid") === "1";
    const destination_tag = valueAtNumber("destination_tag");
    const t1 = valueAtNumber("t1");
    const t2 = valueAtNumber("t2");
    const imm = valueAtNumber("imm");
    const dest_fu_type = valueAt("dest_fu");
    const is_imm = valueAt("is_imm") === "1";
    const branch_mask = hexStringToMask(
      valueAt("branch_mask"),
      BRANCH_MASK_LENGTH
    );

    return {
      valid,
      destination_tag,
      t1,
      t2,
      imm,
      dest_fu_type,
      is_imm,
      branch_mask,
    };
  };

  const rs_table: RsEntry[] = [];
  for (let i = 0; i < RS_SIZE; i++) {
    const entry = parseRsEntry(rs_data, i);
    rs_table.push(entry);
  }

  // After the loop that populates rs_table, replace the previous rsRowData block with the following:

  interface RsRowData {
    // The index of the reservation station entry.
    index: number;
    // The CSS class for the entire row (indicating overall readiness or validity).
    rowClass: string;
    // The CSS class for the T1 cell (green if ready, yellow if waiting, or grey if invalid).
    t1Class: string;
    // The CSS class for the T2 cell (green if ready, yellow if waiting, or grey if not used or invalid).
    t2Class: string;
    // The CSS class for the Immediate (Imm) cell (green if immediate is used, grey otherwise).
    immClass: string;
    // The display value for T1.
    t1Value: string | number;
    // The display value for T2.
    t2Value: string | number;
    // The display value for the immediate value.
    immValue: string | number;
  }

  const rs_row_data = rs_table.map((entry, i): RsRowData => {
    let row_class, t1_class, t2_class, imm_class;
  
    if (!entry.valid) {
      // For invalid entries, use red for all cells
      row_class = "bg-red-300 dark:bg-red-700";
      t1_class = "bg-red-300 dark:bg-red-700";
      t2_class = "bg-red-300 dark:bg-red-700";
      imm_class = "bg-red-300 dark:bg-red-700";
    } else {
      // For valid entries, determine classes based on readiness and type
      const is_t1_ready = isReady(entry.t1);
      const is_t2_ready = !entry.is_imm && isReady(entry.t2);
  
      row_class = (is_t1_ready && is_t2_ready)
        ? "bg-green-300 dark:bg-green-700"
        : "bg-white dark:bg-gray-800";
      t1_class = is_t1_ready
        ? "bg-green-300 dark:bg-green-700"
        : "bg-yellow-300 dark:bg-yellow-700";
      t2_class = entry.is_imm
        ? "bg-gray-400 dark:bg-gray-600"
        : (is_t2_ready
            ? "bg-green-300 dark:bg-green-700"
            : "bg-yellow-300 dark:bg-yellow-700");
      imm_class = entry.is_imm
        ? (entry.imm !== 0
            ? "bg-green-300 dark:bg-green-700"
            : "bg-gray-400 dark:bg-gray-600")
        : "bg-gray-400 dark:bg-gray-600";
    }
  
    // Determine the display values
    const t2_value = entry.is_imm ? "-" : entry.t2;
    const imm_value = entry.is_imm ? entry.imm : "-";
  
    // Map snake_case variables to camelCase keys to conform to RsRowData
    return {
      index: i,
      rowClass: row_class,
      t1Class: t1_class,
      t2Class: t2_class,
      immClass: imm_class,
      t1Value: entry.t1,
      t2Value: t2_value,
      immValue: imm_value,
    };
  });

  const subsection_comp = show_subsection ? (
    <div className="section sub-section">
      <h2 className="subsection-header">RS</h2>

      {/* View Mode Button */}
      {
        // <div className="flex items-center justify-center">
        //   <button className="btn btn-babyblue" onClick={handleViewModeChange}>
        //     {"Instruction View Mode: " + RsViewToString(view_mode)}
        //   </button>
        // </div>
      }

      {/* RS Table */}
      <table className="min-w-full text-center mt-4">
        <thead>
          <tr>
            <th className="border px-4 py-2">RS #</th>
            <th className="border px-4 py-2">T1</th>
            <th className="border px-4 py-2">T2</th>
            <th className="border px-4 py-2">Imm</th>
          </tr>
        </thead>
        <tbody>
          {rs_row_data.map((row) => (
            <tr key={row.index} className={row.rowClass}>
              <td className={`border px-4 py-2 ${row.rowClass}`}>{row.index}</td>
              <td className={`border px-4 py-2 ${row.t1Class}`}>
                {row.t1Value}
              </td>
              <td className={`border px-4 py-2 ${row.t2Class}`}>
                {row.t2Value}
              </td>
              <td className={`border px-4 py-2 ${row.immClass}`}>
                {row.immValue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;

  return (
    <div className="section main-section">
      <a onClick={handleHeaderClick}>
        <h1 className="mainsection-header">Reservation Station</h1>
      </a>
      {subsection_comp}
    </div>
  );
};

export default ReservationStation;
