"use client";
import "./Section.css";
import { MouseEvent, useState } from "react";

const SIZE = 16;
export const segment_mask_table = (size: number, mask: string) => {
  const segments = [];
  if (mask) {
    let remaining_mask = mask;
    while (remaining_mask.length > 0) {
      let segment = remaining_mask.slice(-size);
      remaining_mask = remaining_mask.slice(0, -size);

      if (segment.length < size) {
        segment.padStart(size - segment.length, "0");
      }
      segments.push(segment);
    }
  }
  return segments;
};

const ReadyList: React.FC<{ ready_list_data: any }> = ({ ready_list_data }) => {
  const [show_subsection, setShowSubsection] = useState(true);

  // Open / Close subsection when clicking the header
  const handleHeaderClick = (event: MouseEvent) => {
    event.preventDefault();
    setShowSubsection(!show_subsection);
  };

  // Extract the ready_list_data
  const ready_state_mask: string =
    ready_list_data["READY_LIST.ready_state_mask"];
  const ready_segments = ready_state_mask
    ? segment_mask_table(SIZE, ready_state_mask)
    : ["0".repeat(SIZE), "0".repeat(SIZE), "0".repeat(SIZE), ".".repeat(SIZE)];
  // console.log(ready_segments);

  const tables = ready_segments.map((ready_segment, segment_index) => (
    <table key={segment_index}>
      <thead>
        <tr>
          <th>Reg #</th>
          <th>Ready</th>
        </tr>
      </thead>

      {/* Actual Register Values */}
      <tbody>
        {Array.from({ length: SIZE }, (_, i) => {
          const bit_index = ready_segment.length - i - 1;
          const ready = ready_segment[bit_index] == "1" ? "Y" : "N";
          const reg_index = segment_index * SIZE + i;
          return (
            <tr key={i}>
              <td className={ready == "Y" ? "emerald" : "red"}>{reg_index}</td>
              <td className={ready == "Y" ? "emerald" : "red"}>{ready}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ));

  const subsection_comp = show_subsection ? (
    <div className="section sub-section">
      <h2 className="subsection-header">Status</h2>

      <div className="flex flex-row gap-x-1">
        {/* Creating Segment Tables */}
        {tables}
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
