"use client";

import "./Section.css";
import { MouseEvent, useState, useMemo } from "react";
import {
  parse_instruction,
  convert_reg_hex_to_dec,
  hexStringToNumber,
  hexStringToMask,
  reverseStr,
} from "@/lib/utils";

// TODO: Make this a Config File parameter
const RS_SIZE = 8;
const RS_PREFIX = "RS";
const BRANCH_MASK_LENGTH = 4;

enum RsView {
  Asm = 0,
  Hex,
  Binary,
  __Length,
}

const rsViewToString = (view: RsView): string => {
  switch (view) {
    case RsView.Asm:
      return "ASM";
    case RsView.Hex:
      return "HEX";
    case RsView.Binary:
      return "BIN";
    default:
      return "Invalid";
  }
};

interface RsEntry {
  valid: boolean;
  destinationTag: number;
  t1: number;
  t2: number;
  imm: number;
  destFuType: number;
  isImm: boolean;
  branchMask: string;
}

interface RsRowData {
  index: number;
  rowClass: string;
  t1Class: string;
  t2Class: string;
  immClass: string;
  t1Value: string | number;
  t2Value: string | number;
  immValue: string | number;
}

interface ReservationStationProps {
  rsData: any;
  readyListData: any;
}

const ReservationStation: React.FC<ReservationStationProps> = ({
  rsData,
  readyListData,
}) => {
  const [showSubSection, setShowSubSection] = useState(true);
  const [viewMode, setViewMode] = useState<RsView>(RsView.Asm);

  const handleHeaderClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setShowSubSection((prev) => !prev);
  };

  const handleViewModeChange = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setViewMode((prev) => (prev + 1) % RsView.__Length);
  };

  const readyStateMaskBigEndian: string =
    readyListData?.["READY_LIST.ready_state_mask"] ?? "";
  const readyStateMask: string = reverseStr(readyStateMaskBigEndian);

  const isReady = (reg: number): boolean => readyStateMask[reg] === "1";

  const parseRsEntry = (data: any, index: number): RsEntry => {
    const keyPrefix = `${RS_PREFIX}.rs_data[${index}]`;

    const getValue = (key: string): string => data[`${keyPrefix}.${key}`];
    const getValueNumber = (key: string): number =>
      hexStringToNumber(getValue(key));

    return {
      valid: getValue("valid") === "1",
      destinationTag: getValueNumber("destination_tag"),
      t1: getValueNumber("t1"),
      t2: getValueNumber("t2"),
      imm: getValueNumber("imm"),
      destFuType: Number(getValue("dest_fu")),
      isImm: getValue("is_imm") === "1",
      branchMask: hexStringToMask(getValue("branch_mask"), BRANCH_MASK_LENGTH),
    };
  };

  const rsTable: RsEntry[] = useMemo(() => {
    const table: RsEntry[] = [];
    for (let i = 0; i < RS_SIZE; i++) {
      table.push(parseRsEntry(rsData, i));
    }
    return table;
  }, [rsData]);

  const rsRowData: RsRowData[] = useMemo(() => {
    return rsTable.map((entry, i) => {
      let rowClass: string;
      let t1Class: string;
      let t2Class: string;
      let immClass: string;

      if (!entry.valid) {
        rowClass = "bg-red-300 dark:bg-red-700";
        t1Class = rowClass;
        t2Class = rowClass;
        immClass = rowClass;
      } else {
        const isT1Ready = isReady(entry.t1);
        const isT2Ready = !entry.isImm && isReady(entry.t2);

        rowClass =
          isT1Ready && isT2Ready
            ? "bg-green-300 dark:bg-green-700"
            : "bg-white dark:bg-gray-800";
        t1Class = isT1Ready
          ? "bg-green-300 dark:bg-green-700"
          : "bg-yellow-300 dark:bg-yellow-700";
        t2Class = entry.isImm
          ? "bg-gray-400 dark:bg-gray-600"
          : isT2Ready
          ? "bg-green-300 dark:bg-green-700"
          : "bg-yellow-300 dark:bg-yellow-700";
        immClass = entry.isImm
          ? entry.imm !== 0
            ? "bg-green-300 dark:bg-green-700"
            : "bg-gray-400 dark:bg-gray-600"
          : "bg-gray-400 dark:bg-gray-600";
      }

      return {
        index: i,
        rowClass,
        t1Class,
        t2Class,
        immClass,
        t1Value: entry.t1,
        t2Value: entry.isImm ? "-" : entry.t2,
        immValue: entry.isImm ? entry.imm : "-",
      };
    });
  }, [rsTable, readyStateMask]);

  const subSectionComp = showSubSection && (
    <div className="section sub-section">
      <h2 className="subsection-header">RS</h2>
      {/* View Mode Button */}
      {
      // <div className="flex items-center justify-center">
      //   <button className="btn btn-babyblue" onClick={handleViewModeChange}>
      //     {`Instruction View Mode: ${rsViewToString(viewMode)}`}
      //   </button>
      // </div>
      }
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
          {rsRowData.map((row) => (
            <tr key={row.index} className={row.rowClass}>
              <td className={`border px-4 py-2 ${row.rowClass}`}>{row.index}</td>
              <td className={`border px-4 py-2 ${row.t1Class}`}>{row.t1Value}</td>
              <td className={`border px-4 py-2 ${row.t2Class}`}>{row.t2Value}</td>
              <td className={`border px-4 py-2 ${row.immClass}`}>{row.immValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="section main-section">
      <a href="#" onClick={handleHeaderClick}>
        <h1 className="mainsection-header">Reservation Station</h1>
      </a>
      {subSectionComp}
    </div>
  );
};

export default ReservationStation;
