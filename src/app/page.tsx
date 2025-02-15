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
import ThemeToggle from "@/components/ThemeToggle";
const Home = () => {
  return (
    <>
    <header>
        <ThemeToggle />
    </header>
    <main>
    <div className="home">
        <div className="title">
        <h1 className="binary-flip" data-text="VCDive">
          000000
        </h1>
        <h3 className="text-3xl font-bold">Visual Debugger for VCD</h3>
        </div>
      <div className="home-container">
        <FileUpload />
      </div>
    </div>
    </main>
    </>
  );
};

export default Home;
