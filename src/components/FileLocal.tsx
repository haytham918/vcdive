import "../app/home.css";
import ParseButton from "./ParseButton";
import React from "react";
const FileLocal: React.FC<{
    file_name: string;
    is_loading: boolean;
    loadingHandler: (loading_val: boolean) => void;
    fileNameHandler: (str: string) => void;
}> = ({ file_name, is_loading, loadingHandler, fileNameHandler }) => {
    const inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        fileNameHandler(event.target?.value);
    };
    return (
        <div className="w-[85%] p-2 gap-y-2 flex-col flex">
            <h2 className="text-2xl text-center font-bold mb-2">
                Specify a File in /inputs/ on Local
            </h2>
            <input
                placeholder="Input the name of the file inside /inputs/ directory"
                className="input-filename"
                onChange={inputHandler}
            ></input>
            <div className="flex w-[100%]">
                <ParseButton
                    method="local"
                    uploaded_file={null}
                    file_name={file_name}
                    is_loading={is_loading}
                    loadingHandler={loadingHandler}
                />
            </div>
        </div>
    );
};

export default React.memo(FileLocal);
