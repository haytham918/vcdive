"use client";

/* 
    Main Page button to parse vcd contents
*/
import { useRouter } from "next/navigation";
import { SpinnerGap } from "phosphor-react";

const ParseButton: React.FC<{
  uploaded_file: File | null;
  is_loading: boolean; // is_loading state from above
  setLoadingTrue: () => void; // set loading handler passed
}> = ({ uploaded_file, is_loading, setLoadingTrue }) => {
  const router = useRouter();

  const handleButtonClick = async () => {
    // Check if the file is empty
    if (!uploaded_file) {
      alert("Nothing to parse. Check your input");
      return;
    }
    setLoadingTrue();

    try {
      // Call the parse endpoint
      const response = await fetch("/backend/parse/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: uploaded_file }),
      });

      if (!response.ok) {
        throw new Error(`Error trying to parse: ${response.status}`);
      }

      const result = await response.json();

      const data = result.data;
      console.log("DATA IS: ", data);
      // TODO:

      // Navigate to the debugger page
      router.push("/debugger/");
    } catch (err) {
      console.log("Error: ", err);
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
