"use client";

import DebuggerHeader from "@/components/DebuggerHeader";
import Section from "@/components/processor_components/Section";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
/*

    Page for the /debugger

*/
const DebuggerPage = () => {
  const [file_name, setFileName] = useState(""); // File Name for current parsed file
  const [include_neg, setIncludeNeg] = useState(false); // Whether include neg edge
  const [num_pos_cycles, setNumPosCycles] = useState(0); // Number of positive cycles
  const [num_neg_cycles, setNumNegCycles] = useState(0); // Number of all cycles
  const [cur_cycle, setCurCycle] = useState(0);

  // Async function to fetch the metadata about the current parsed file
  const fetch_file_metada = async () => {
    const response = await fetch("/backend/file_metadata/", { method: "GET" });
    // Fail to get result
    if (!response.ok) {
      console.log("Failed Fetching Metadata");
      return;
    }

    const fetched_metadata = await response.json();
    console.log("FETCHED META", fetched_metadata);
    setFileName(fetched_metadata["file_name"]);
    setNumPosCycles(fetched_metadata["num_pos_cycles"]);
    setNumNegCycles(fetched_metadata["num_neg_cycles"]);
  };

  // Fetch parsed information about this cycle
  const fetch_cycle_info = async () => {
    // Check if file_name is valid
    if (file_name !== "") {
      const pos_neg = include_neg ? "neg" : "pos"; // Check if we are including neg edges
      // Call a get REQUEST
      const response = await fetch(`/backend/${pos_neg}/${cur_cycle}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.log("Fetching Cycle info");
        return;
      }

      const data = await response.json();
      console.log("FETCHED CYCLE DATA: ", data);
    }
  };

  // Use effect to call fetch file metadata whenever rendering
  useEffect(() => {
    fetch_file_metada();
  }, []);

  // use effect to fetch cycle info whenever the include_neg or cur_cycle changes
  useEffect(() => {
    fetch_cycle_info();
  }, [include_neg, cur_cycle]);

  return (
    <>
      <header>
        <DebuggerHeader />
        <ThemeToggle />
      </header>
      <main>
        <Section />
      </main>
    </>
  );
};

export default DebuggerPage;
