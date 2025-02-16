"use client";

/* 
    Main Page button to parse vcd contents
*/
import { useRouter } from "next/navigation";
import { SpinnerGap } from "phosphor-react";
import { Method } from "@/app/page";
const ParseButton: React.FC<{
  method: Method;
  uploaded_file: File | null;
  file_name: string;
  is_loading: boolean; // is_loading state from above
  loadingHandler: (loading_val: boolean) => void; // Set loading icon
}> = ({ method, uploaded_file, file_name, is_loading, loadingHandler }) => {
  const router = useRouter();

  const handleButtonClickUpload = async () => {
    // Check if the file is empty
    if (!uploaded_file) {
      alert("Nothing to parse. Check your input");
      return;
    }
    loadingHandler(true);
    try {
      const formData = new FormData();
      formData.append("file", uploaded_file);

      // Send entire file in one request
      const response = await fetch("/backend/parse/", {
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
      loadingHandler(false);
    }
  };

  // Button for the CAEN page
  const handleButtonClickCaen = async () => {
    // Check if the filename is empty
    if (file_name === "") {
      alert("You need to specify the filename");
      return;
    }
    loadingHandler(true);
    try {
      // Do a post request and send the file name
      const response = await fetch("/backend/caen/", {
        method: "POST",
        body: JSON.stringify({ file_name: file_name }),
      });

      // Wait for the backend
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      console.log(result.message);
    } catch (error: any) {
      console.log("FAILED: ", error.message);
    } finally {
      loadingHandler(false);
    }
  };

  // Click parse button when it's local
  const handleButtonClickLocal = async () => {
    // Check if the filename is empty
    if (file_name === "") {
      alert("You need to specify the filename");
      return;
    }
    loadingHandler(true);
    try {
      // Do a post request and send the file name
      const response = await fetch("/backend/local/", {
        method: "POST",
        body: JSON.stringify({ file_name: file_name }),
      });

      // Wait for the backend
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      console.log(result.message);
    } catch (error: any) {
      console.log("FAILED: ", error.message);
    } finally {
      loadingHandler(false);
    }
  };

  let handleButtonClick; // handler for clicking the button, different backend endpoints
  if (method === "drop") {
    handleButtonClick = handleButtonClickUpload;
  } else if (method === "caen") {
    handleButtonClick = handleButtonClickCaen;
  } else {
    handleButtonClick = handleButtonClickLocal;
  }

  return (
    <button
      className="ml-auto btn btn-primary"
      onClick={handleButtonClick}
      disabled={is_loading}
    >
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
