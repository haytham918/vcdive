"use client";
import "./Section.css";
import { MouseEvent, useState } from "react";

const ReadyList = () => {
  const [show_subsection, setShowSubsection] = useState(true);

  // Open / Close subsection when clicking the header
  const handleHeaderClick = (event: MouseEvent) => {
    event.preventDefault();
    setShowSubsection(!show_subsection);
  };

  const subsection_comp = show_subsection ? (
    <div className="section sub-section">
      <h2 className="subsection-header">Status</h2>

      <div className="flex flex-row gap-x-1">
        <table>
          <thead>
            <tr>
              <th>Reg #</th>
              <th>Ready</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>Y</td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Reg #</th>
              <th>Ready</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>31</td>
              <td>N</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  ) : null;

  return (
    <div className="section main-section">
      <a onClick={handleHeaderClick}>
        <h1 className="mainsection-header">Ready List</h1>
      </a>
      {subsection_comp}
    </div>
  );
};

export default ReadyList;
