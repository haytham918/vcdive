"use client";

/* 
    Main Page button to parse vcd contents
*/
import { useRouter } from "next/navigation";

const ParseButton: React.FC<{ file_content: string }> = ({ file_content }) => {
  const router = useRouter();
  const handleButtonClick = async () => {
    // Check if the file is empty
    if (!file_content.trim()) {
      alert("Nothing to parse. Check your input");
      return;
    }

    try {
      // Call the parse endpoint
      const response = await fetch("/backend/parse/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: file_content }),
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
      Parse VCD Contents
    </button>
  );
};

export default ParseButton;
