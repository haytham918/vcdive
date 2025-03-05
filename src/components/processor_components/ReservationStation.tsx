"use client";
import "./Section.css";
import { MouseEvent, useState } from "react";
// import lib/utils.ts
import { parse_instruction, convert_reg_hex_to_dec } from "@/lib/utils";

// TODO: Make this a config file parameter
const RS_SIZE = 8;

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
      return "BINARY";
    default:
      return "Invalid";
  }
};

const ReservationStation: React.FC<{ rs_data: any }> = ({ rs_data }) => {
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

  const renderInstruction = (index: number) => {
    // TODO
  }

  const subsection_comp = show_subsection ? (
    <div className="section sub-section">
      <h2 className="subsection-header">RS</h2>

      {/* View Mode Button */}
      <div className="flex items-center justify-center">
        <button className="btn btn-babyblue" onClick={handleViewModeChange}>
          {RsViewToString(view_mode)}
        </button>
      </div>

    </div>
  ) : null;

  return (
    <div className="section main-section">
      <h1 className="section-header" onClick={handleHeaderClick}>
        Reservation Station
      </h1>
    </div>
  );
};
