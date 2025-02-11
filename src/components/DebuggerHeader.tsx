"use client";
import Link from "next/link";
import { ArrowUUpLeft } from "phosphor-react";
import "./DebuggerHeader.css";
import CycleNavigation from "./CycleNavigation";
import NSToggle from "./NSToggle";
// Additional header stuff for the debugger page
const DebuggerHeader = () => {
  return (
    <div className="debugger-header">
      {/* Button to go back */}
      <Link href="/" className="btn btn-babyblue">
        <ArrowUUpLeft size={25} weight="bold" />
      </Link>

      <h1 className="text-lg font-bold">VCDive</h1>
      <CycleNavigation />
      <NSToggle />
    </div>
  );
};

export default DebuggerHeader;
