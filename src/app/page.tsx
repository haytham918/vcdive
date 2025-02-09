/*

  Main Page of the Visual Debugger:
  Layout:
    -- VCDive Animation
    -- Description
    -- Dropzone
    -- Textarea of Result 
    -- Reset Button & Upload Buton
*/

import "@/app/home.css";
import FileUpload from "@/components/FileUpload";
const Home = () => {
  return (
    <div className="home">
      <div className="home-container">
        <h1 className="binary-flip" data-text="VCDive">
          000000
        </h1>
        <h3 className="text-2xl">Visual Debugger for VCD</h3>
        <FileUpload />
      </div>
    </div>
  );
};

export default Home;
