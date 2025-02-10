"use client";
import Link from "next/link";
import { ArrowUUpLeft } from "phosphor-react";
import "./DebuggerHeader.css";
// Additional header stuff for the debugger page
const DebuggerHeader = () => {
  return (
    <div className="debugger-header">
      {/* Button to go back */}
      <Link href="/" className="btn btn-babyblue">
        <ArrowUUpLeft size={25} weight="bold" />
        <span> Home </span>
      </Link>

      <h1 className="text-xl font-bold">VCDive Debugger</h1>
    </div>
  );
};

export default DebuggerHeader;
