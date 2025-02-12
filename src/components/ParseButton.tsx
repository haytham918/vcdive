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

    const CHUNK_SIZE = 10 * 1024 * 1024;
    let start = 0;
    let part = 0;
    const totalParts = Math.ceil(uploaded_file.size / CHUNK_SIZE);
    try {
      while (start < uploaded_file.size) {
        const chunk = uploaded_file.slice(start, start + CHUNK_SIZE);
        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("part", part.toString()); // Keep track of chunk number
        formData.append("filename", uploaded_file.name);

        // If this is the last
        if (part === totalParts - 1) {
          formData.append("final", "true");
        }

        // Send chunk to the backend
        const response = await axios.post("/backend/parse/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 600000, // 5-minute timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) /
                (progressEvent.total || progressEvent.loaded)
            );
            console.log(`Chunk ${part} Upload Progress: ${percentCompleted}%`);
          },
        });

        console.log(`Chunk ${part} uploaded successfully:`, response.data);

        // Move to the next chunk
        start += CHUNK_SIZE;
        part += 1;
      }

      console.log("Upload completed. Processing file...");
      // TODO: Navigate to the debugger page
      // router.push("/debugger/");
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.warn("Upload canceled:", error.message);
      } else if (error.response) {
        console.error(`Error ${error.response.status}: ${error.response.data}`);
      } else {
        console.error("Upload failed:", error.message);
      }
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
