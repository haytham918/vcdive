import { useCallback, useContext, useEffect, useState } from "react";
import "./DebuggerHeader.css";
import toast from "react-hot-toast";
import React from "react";
import { PRF_SIZE } from "./processor_components/PRF_Ready_Free";
import { TagTrackContext } from "./TagTrackProvider";

const CycleNavigation: React.FC<{
    cur_cycle: number; // The current cycle
    end_cycle_index: number;
    cycleHandler: (cycle: number) => void; // set the cycle
}> = ({ cur_cycle, end_cycle_index, cycleHandler }) => {
    // When click the First button
    const handleStartCycle = useCallback(() => {
        if (cur_cycle != 0) {
            cycleHandler(0);
        }
    }, [cur_cycle, cycleHandler]);

    // When click the end button
    const handleEndCycle = useCallback(() => {
        if (cur_cycle != end_cycle_index) {
            cycleHandler(end_cycle_index);
        }
    }, [cur_cycle, end_cycle_index, cycleHandler]);

    // Handler funciton for when clicking -10, -1, +1, +10
    const handleCycleChange = useCallback(
        (delta: number) => {
            // If the current destination is over the max cycle (when +1 or +10)
            const destination: number = cur_cycle + delta;
            if (destination > end_cycle_index) {
                cycleHandler(end_cycle_index);
            }
            // if the current destination is less than 0 (when -1 or -10)
            else if (destination < 0) {
                cycleHandler(0);
            } else {
                cycleHandler(destination);
            }
        },
        [cur_cycle, end_cycle_index, cycleHandler]
    );

    const [input_val, setInputVal] = useState("");

    // Function that updates input as user types
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputVal(event.target?.value);
    };
    // Handler function when user inputs a cycle number
    const handleInputCycle = () => {
        if (input_val.trim() !== "") {
            const input_cycle = Number(input_val);
            if (input_cycle > end_cycle_index) {
                toast.error("Specified Cycle\nOut of Bound");
                setInputVal("");
                return;
            }
            cycleHandler(input_cycle);
            setInputVal("");
        }
    };

    // Function to handle user type on input
    const handleInputKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "-" || event.key === "Subtract") {
            event.preventDefault();
            toast.error("No Negative Cycle");
            return;
        }
        if (event.key === "Enter") {
            handleInputCycle();
        }
    };
    // useEffect for keyboard
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "q": {
                    // Go to the previous 10th cycle button
                    handleCycleChange(-10);
                    break;
                }
                case "w": {
                    // Go to the next 10th cycle button
                    handleCycleChange(10);
                    break;
                }
                case "e": {
                    // Go to the end cycle
                    handleEndCycle();
                    break;
                }
                case "r": {
                    // Go to the first cycle
                    handleStartCycle();
                    break;
                }
                case "ArrowLeft": {
                    // Go to the previous cycle
                    handleCycleChange(-1);
                    break;
                }
                case "ArrowRight": {
                    // Go to the next cycle
                    handleCycleChange(1);
                    break;
                }
                default:
                    // Nothing happens for recognized cycle
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleStartCycle, handleCycleChange, handleEndCycle]);

    // Context Provider Stuff
    const { tag, setTag } = useContext(TagTrackContext);

    // Input Tag
    const [input_tag, setInputTag] = useState("");
    const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputTag(event.target?.value);
    };

    // Handler function when user inputs a tag number
    const handleInputTag = () => {
        if (input_tag.trim() != "") {
            const input_tag_number = Number(input_tag);
            if (input_tag_number > PRF_SIZE) {
                toast.error("Specified Tag\nLarger than Size");
                setInputTag("");
                return;
            }
            setTag(input_tag_number);
        } else {
            setInputTag("");
            setTag(null);
        }
    };

    const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "-" || event.key === "Subtract") {
            event.preventDefault();
            toast.error("No Negative Tag");
            return;
        }
        if (event.key === "Enter") {
            handleInputTag();
        }
    };
    return (
        <div className="cycle-navigation-container">
            {/* Go to Cycle 0 Button */}
            <button className="btn btn-babyblue" onClick={handleStartCycle}>
                First (r)
            </button>

            {/* Go to the previous 10th cycle button */}
            <button
                className="btn btn-babyblue"
                onClick={() => handleCycleChange(-10)}
            >
                -10 (q)
            </button>

            {/* Go to the previous cycle button */}
            <button
                className="btn btn-babyblue"
                onClick={() => handleCycleChange(-1)}
            >
                -1 (&#8592;)
            </button>

            {/* Go to next cycle button */}
            <button
                className="btn btn-babyblue"
                onClick={() => handleCycleChange(1)}
            >
                +1 (&#8594;)
            </button>

            {/* Go to the next 10th cycle button */}
            <button
                className="btn btn-babyblue"
                onClick={() => handleCycleChange(10)}
            >
                +10 (w)
            </button>

            {/* Go to the last cycle button */}
            <button className="btn btn-babyblue" onClick={handleEndCycle}>
                End (e)
            </button>

            {/* Input for Cycle */}
            <input
                className="input-cycle"
                placeholder="Cycle #"
                type="number"
                min="0"
                value={input_val}
                max={end_cycle_index}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputCycle}
            />

            <input
                className="input-tag"
                placeholder="Tag #"
                type="number"
                min="0"
                max={PRF_SIZE - 1}
                value={input_tag}
                onChange={handleTagChange}
                onKeyDown={handleTagKeyDown}
                onBlur={handleInputTag}
            />
        </div>
    );
};

export default React.memo(CycleNavigation);
