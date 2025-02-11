"use client";

import { MouseEvent, useState } from "react";
import "./Section.css";

const Section = () => {
  const [show_subsection, setShowSubsection] = useState(true);

  // Open / Close subsection when clicking the header
  const handleHeaderClick = (event: MouseEvent) => {
    event.preventDefault();
    setShowSubsection(!show_subsection);
  };

  const subsection_comp = show_subsection ? (
    <div className="section sub-section">
      <h2 className="subsection-header">Subsection</h2>

      <div className="entry">Some Stuff</div>
    </div>
  ) : null;

  return (
    <div className="section main-section">
      <a onClick={handleHeaderClick}>
        <h1 className="mainsection-header">Instruction Memory</h1>
      </a>

      {subsection_comp}
    </div>
  );
};
export default Section;
