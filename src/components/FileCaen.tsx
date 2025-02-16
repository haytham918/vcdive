import "../app/home.css";
import ParseButton from "./ParseButton";

const FileCaen: React.FC<{
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
      <h2 className="text-2xl text-center font-bold">Specify a File on CAEN</h2>
      <h3 className="text-xl text-center">
        Make sure you are on{" "}
        <span className="font-bold text-red-500">U-M Wifi (VPN)</span>
      </h3>
      <h3 className="text-lg text-center mb-2 text-[var(--color-accent)]">
        Remember to set your uniqname/password
      </h3>
      <input
        placeholder="Input the name of the file inside /vcd/ directory"
        className="input-filename"
        onChange={inputHandler}
      ></input>
      <div className="flex w-[100%]">
        <ParseButton
          method="caen"
          uploaded_file={null}
          file_name={file_name}
          is_loading={is_loading}
          loadingHandler={loadingHandler}
        />
      </div>
    </div>
  );
};

export default FileCaen;
