"use client";

import DebuggerHeader from "@/components/DebuggerHeader";
import PhysicalRegisterFile from "@/components/processor_components/PhysicalRegisterFile";
import ReadyList from "@/components/processor_components/ReadyList";
import Section from "@/components/processor_components/Section";
import ThemeToggle from "@/components/ThemeToggle";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
/*

    Page for the /debugger

*/
const DebuggerPage = () => {
  const [file_name, setFileName] = useState(""); // File Name for current parsed file
  const [include_neg, setIncludeNeg] = useState(false); // Whether include neg edge
  const [num_pos_clocks, setNumPosClocks] = useState(0); // Number of positive clocks
  const [num_neg_clocks, setNumNegClocks] = useState(0); // Number of all clocks
  const [cur_cycle, setCurCycle] = useState(0);

  // The max cycle index based on including neg edges or not
  const end_cycle_index = include_neg ? num_neg_clocks - 1 : num_pos_clocks - 1;

  const negFlipHandler = () => {
    setIncludeNeg(!include_neg);
  };

  // Handler function to set the current cycle
  const cycleHandler = useCallback((cycle: number) => {
    setCurCycle(cycle);
    toast.success("Changed Cycle Succesfully");
  }, []);

  console.log("Current cycle is", cur_cycle);
  // Async function to fetch the metadata about the current parsed file
  const fetch_file_metada = async () => {
    const response = await fetch("/backend/file_metadata/", { method: "GET" });
    // Fail to get result
    if (!response.ok) {
      toast.error("Failed Fetching Metadata");
      return;
    }

    const fetched_metadata = await response.json();
    console.log("FETCHED META", fetched_metadata);
    setFileName(fetched_metadata["file_name"]);
    setNumPosClocks(fetched_metadata["num_pos_clocks"]);
    setNumNegClocks(fetched_metadata["num_neg_clocks"]);
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
        toast.error("FAILED Fetching Cycle info");
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
  }, [include_neg, cur_cycle, file_name]);

  return (
    <>
      <header>
        <DebuggerHeader
          file_name={file_name}
          cur_cycle={cur_cycle}
          end_cycle_index={end_cycle_index}
          include_neg={include_neg}
          negFlipHandler={negFlipHandler}
          cycleHandler={cycleHandler}
        />
        <ThemeToggle />
      </header>
      <main>
        <div className="ml-8 mr-8">
          <ReadyList />
        </div>
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            color: "dark-gray",
            fontWeight: "bold",
          },
          success: {
            style: {
              background: "beige",
            },
          },
          error: {
            style: {
              background: "beige",
            },
          },
        }}
      />
    </>
  );
};

export default DebuggerPage;
