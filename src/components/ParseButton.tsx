"use client";

/* 
    Main Page button to parse vcd contents
*/
import { useRouter } from "next/navigation";
import { SpinnerGap } from "phosphor-react";
import axios from "axios";
const ParseButton: React.FC<{
  uploaded_file: File | null;
  is_loading: boolean; // is_loading state from above
  setLoadingTrue: () => void; // set loading handler passed
  setLoadingFalse: () => void;
}> = ({ uploaded_file, is_loading, setLoadingTrue, setLoadingFalse }) => {
  const router = useRouter();

  const handleButtonClick = async () => {
    // Check if the file is empty
    if (!uploaded_file) {
      alert("Nothing to parse. Check your input");
      return;
    }
    setLoadingTrue();

    // const CHUNK_SIZE = 10 * 1024 * 1024;
    // let start = 0;
    // let part = 0;
    // const totalParts = Math.ceil(uploaded_file.size / CHUNK_SIZE);
    try {
      const formData = new FormData();
      formData.append("file", uploaded_file);

      // Send entire file in one request
      const response = await fetch("/backend/parse", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      console.log("Upload completed successfully:", result.data);

      // TODO: Navigate to the debugger page
      // router.push("/debugger/");
    } catch (error: any) {
      console.error("Failed: ", error.message);
    } finally {
      setLoadingFalse();
    }
  };

  return (
    <button className="ml-auto btn btn-primary" onClick={handleButtonClick}>
      {!is_loading ? (
        <p className="w-[180px]">Parse VCD Contents</p>
      ) : (
        <SpinnerGap
          size={25}
          weight="bold"
          className="w-[180px] animate-spin"
        />
      )}
    </button>
  );
};

export default ParseButton;
