"use client";

/*
    Component used for drop-upload file
    Layout:
        -- Drop-Zone
        -- Display What file
        -- Reset Button (Clear) && Parse Contents Button (Placeholder rn)
*/
import { FileRejection, useDropzone } from "react-dropzone";
import { useState, useCallback } from "react";
import ParseButton from "./ParseButton";
import toast from "react-hot-toast";

// This is the drop-upload box using react-dropzone
const FileUpload: React.FC<{
  file_name: string;
  is_loading: boolean;
  loadingHandler: (loading_val: boolean) => void;
  fileNameHandler: (str: string) => void;
}> = ({ file_name, is_loading, loadingHandler, fileNameHandler }) => {
  const [file, setFile] = useState<File | null>(null);

  // Read in the file
  const onDrop = useCallback((accepted_file: File[]) => {
    if (accepted_file.length > 0) {
      const uploaded_file = accepted_file[0];

      // const reader = new FileReader();
      // reader.onload = (event : any) => {
      //   const text = event.target?.result as string
      //   console.log(text)
      // }
      // reader.readAsText(uploaded_file)
      fileNameHandler(uploaded_file.name);

      setFile(uploaded_file);
    }
  }, []);

  // If the user is not uploading a vcd file
  const onDropRejected = useCallback((rejected_file: FileRejection[]) => {
    if (rejected_file.length > 0) {
      const { errors } = rejected_file[0];
      errors.forEach((error) => {
        if (error.code === "file-invalid-type") {
          toast.error("Invalid file type.\nPlease upload a .vcd file");
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "text/x-vcard": [".vcd"] },
    multiple: false,
  });

  // For reset button
  const handleReset = () => {
    setFile(null);
    fileNameHandler("");
  };

  // Uploaded file text
  const uploaded_file_component =
    file_name !== "" ? (
      <div className="text-primary font-bold text-lg">
        <span>Uploaded File is: </span>
        <span className="italic">{file_name}</span>
      </div>
    ) : (
      <div className="text-accent font-bold text-lg">Nothing uploaded</div>
    );

  return (
    <div className="w-[85%] p-2 gap-y-2 flex-col flex">
      <h2 className="text-2xl text-center font-bold">Manually Upload a File</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-12 rounded-lg text-center text-black cursor-pointer bg-dropzone-bg border-dropzone-bd transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-100"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? "Drop the file here..."
            : "Drop or upload your .vcd file"}
        </p>
        <p>(large file may not work with drop/upload)</p>
      </div>

      {uploaded_file_component}

      <div className="flex w-[100%]">
        <button
          onClick={handleReset}
          disabled={is_loading}
          className="btn btn-secondary"
        >
          Reset
        </button>
        {/* Parse Button */}
        <ParseButton
          method="drop"
          uploaded_file={file}
          file_name={file_name}
          is_loading={is_loading}
          loadingHandler={loadingHandler}
        />
      </div>
    </div>
  );
};

export default FileUpload;
