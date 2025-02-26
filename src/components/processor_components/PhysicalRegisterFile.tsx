"use client";
import "./Section.css";
import { MouseEvent, useState } from "react";

const PhysicalRegisterFile = () => {
  const [show_subsection, setShowSubsection] = useState(true);

  // Open / Close subsection when clicking the header
  const handleHeaderClick = (event: MouseEvent) => {
    event.preventDefault();
    setShowSubsection(!show_subsection);
  };

  const subsection_comp = show_subsection ? (
    <div className="section sub-section">
      <h2 className="subsection-header">Values</h2>

      <table>
        <thead>
          <tr>
            <th>Hello There</th>
            <th>Hi There</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>What's the </td>
            <td>Hi There</td>
          </tr>
        </tbody>
      </table>
    </div>
  ) : null;

  return (
    <div className="section main-section">
      <a onClick={handleHeaderClick}>
        <h1 className="mainsection-header">Physical Registers</h1>
      </a>
      {subsection_comp}
    </div>
  );
};

export default PhysicalRegisterFile;
