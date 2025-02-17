"use client";
import Link from "next/link";
import { ArrowUUpLeft } from "phosphor-react";
import "./DebuggerHeader.css";
import CycleNavigation from "./CycleNavigation";
import NSToggle from "./NSToggle";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// Additional header stuff for the debugger page
const DebuggerHeader: React.FC<{
  cur_cycle: number;
  end_cycle_index: number;
  cycleHandler: (cycle: number) => void;
}> = ({ cur_cycle, end_cycle_index, cycleHandler }) => {
  const router = useRouter();
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="debugger-header">
      {/* Button to go back */}
      <Link href="/" className="btn btn-babyblue">
        <ArrowUUpLeft size={25} weight="bold" />
      </Link>

      <h1 className="text-lg font-bold">VCDive</h1>
      <CycleNavigation
        cur_cycle={cur_cycle}
        end_cycle_index={end_cycle_index}
        cycleHandler={cycleHandler}
      />
      <NSToggle />
    </div>
  );
};

export default DebuggerHeader;
