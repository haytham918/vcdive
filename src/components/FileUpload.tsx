"use client";

/*
    Component used for drop-upload file
    Layout:
        -- Drop-Zone
        -- TextArea for Extracted Value
        -- Reset Button (Clear) && Parse Contents Button (Placeholder rn)
*/
import { FileRejection, useDropzone } from "react-dropzone";
import { useState, useCallback } from "react";

// This is the drop-upload box using react-dropzone
const FileUpload = () => {
  const [file_content, setFileContent] = useState("");

  // Read in the file
  const onDrop = useCallback((accepted_file: File[]) => {
    if (accepted_file.length > 0) {
      const file = accepted_file[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
      };

      reader.readAsText(file);
    }
  }, []);

  // If the user is not uploading a vcd file
  const onDropRejected = useCallback((rejected_file: FileRejection[]) => {
    if (rejected_file.length > 0) {
      const { errors } = rejected_file[0];
      errors.forEach((error) => {
        if (error.code === "file-invalid-type") {
          alert("Invalid file type. Please upload a .vcd file");
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

  // When type the text area
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(event.target.value);
  };

  // For reset button
  const handleReset = () => {
    setFileContent("");
  };

  return (
    <div className="w-[85%] p-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-6 rounded-lg text-center text-black cursor-pointer bg-dropzone-bg border-dropzone-bd transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-100"
            : "border-gray-300 bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <p className="italic">
          {isDragActive
            ? "Drop the file here..."
            : "Drop or upload your .vcd file"}
        </p>
      </div>
      <textarea
        className="mt-4 p-2 border rounded w-full h-64 bg-textarea-bg border-textarea-bd"
        value={file_content}
        onChange={handleChange}
        placeholder="You can also copy-paste .vcd content here"
      />
      <div className="flex w-[100%]">
        <button onClick={handleReset} className="btn btn-secondary">
          Reset
        </button>
        {/* TODO: Need Actual Parse BUTTON */}
        <button className="ml-auto btn btn-primary">Parse VCD Contents</button>
      </div>
    </div>
  );
};

export default FileUpload;
