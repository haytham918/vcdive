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

  const ready_state_mask: string = reverseStr(
    ready_list_data["READY_LIST.ready_state_mask"]
  );

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
