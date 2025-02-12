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

// This is the drop-upload box using react-dropzone
const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [file_name, setFileName] = useState("");
  const [is_loading, setLoading] = useState(false);

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
      setFileName(uploaded_file.name);

      setFile(uploaded_file);
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

  // For reset button
  const handleReset = () => {
    setFile(null);
    setFileName("");
  };

  // Set Loading Icon
  const setLoadingTrue = () => {
    setLoading(true);
  };

  // Unset loading icon
  const setLoadingFalse = () => {
    setLoading(false);
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
          uploaded_file={file}
          is_loading={is_loading}
          setLoadingTrue={setLoadingTrue}
          setLoadingFalse={setLoadingFalse}
        />
      </div>
    </div>
  );
};

export default FileUpload;
