import { useState, MouseEvent } from "react";

export let GSHARE_LENGTH = 4;

const BranchGshare: React.FC<{
    branch_status: any;
    gshare_gbhr: any;
    control_data: any;
}> = ({ branch_status, gshare_gbhr, control_data }) => {
    // Display
    const [show_subsection, setShowSubsection] = useState(true);
    const handleHeaderClick = (event: MouseEvent) => {
        event.preventDefault();
        setShowSubsection(!show_subsection);
    };

    let gbhr = "0".repeat(GSHARE_LENGTH);
    if (gshare_gbhr) {
        GSHARE_LENGTH = gshare_gbhr.length;
        gbhr = gshare_gbhr;
    }
    let branch_color = "";
    let branch_text = "NONE";
    if (branch_status === "1") {
        branch_color = "text-[--color-accent]"; // Mispredict
        branch_text = "MISPREDICT";
    } else if (branch_status === "2") {
        branch_color = "text-[--color-primary]"; // Correct
        branch_text = "CORRECT";
    }

    // Get prediction, actual, and resolved pht index
    const is_resolved = branch_status !== "0"; // Check we are actually resolving sth
    let resolved_comp = <div className="hidden"></div>;
    // Get the actual taken or not, then get the predicted accordingly
    const actual = control_data["gen_control[0].CONTROL.output_taken"];
    let actual_color = "";
    let predict_color = "";
    let predicted = "0";
    // Get resolved index
    const affects_predictor =
        control_data["gen_control[0].CONTROL.affects_predictor"];
    let resolved_pht = "-"; // Initialize to be -
    if (is_resolved) {
        if (branch_status === "1") {
            // If actual is taken
            if (actual === "1") {
                actual_color = "text-[--color-primary]";
                predict_color = "text-[--color-accent]";
                predicted = "0";
            } else {
                actual_color = "text-[--color-accent]";
                predict_color = "text-[--color-primary]";
                predicted = "1";
            }
        } else {
            // Correct prediction
            predicted = actual;
            if (actual === "1") {
                actual_color = "text-[--color-primary]";
                predict_color = "text-[--color-primary]";
            } else {
                actual_color = "text-[--color-accent]";
                predict_color = "text-[--color-accent]";
            }
        }

        if (affects_predictor === "1") {
            // Update only if the affects_predictor is true
            resolved_pht =
                control_data["gen_control[0].CONTROL.resolved_pht_index"];
        }
    }
    // Render the actual resolved component
    // Opacity low when no resolution
    // Predicted Result:
    // Actual Result:
    // Resolved PHT:
    resolved_comp = (
        <div
            className={`inner-section branch-section partial-info-section w-[100%] mt-1 ${
                is_resolved ? "" : "opacity-10"
            }`}
        >
            <div className="flex">
                Predicted Result:{" "}
                <span className={`${predict_color} ml-auto`}>{predicted}</span>
            </div>
            <div className="flex">
                Actual Result:{" "}
                <span className={`${actual_color} ml-auto`}>{actual}</span>
            </div>
            <div className="flex">
                Resolved PHT:{" "}
                <span className="text-[--color-babyblue] ml-auto">
                    {resolved_pht}
                </span>
            </div>
        </div>
    );

    const subsection_comp = (
        // Branch Info
        <div className="branch-section partial-info-section sub-section font-bold">
            <div className="flex">
                Current Gshare:{" "}
                <div className="ml-auto">
                    {Array.from({ length: GSHARE_LENGTH }, (_, i) => {
                        let history_color = "";
                        if (gbhr[i] === "0") {
                            history_color = "text-[--color-accent]";
                        } else {
                            history_color = "text-[--color-primary]";
                        }
                        return (
                            <span className={history_color} key={i}>
                                {gbhr[i]}
                            </span>
                        );
                    })}
                </div>
            </div>

            <div className="flex">
                Branch Status:{" "}
                <span className={`font-bold ${branch_color} ml-auto`}>
                    {branch_text}
                </span>
            </div>

            {resolved_comp}
        </div>
    );

    return (
        <div>
            <div className="section main-section">
                <a onClick={handleHeaderClick}>
                    <h1 className="mainsection-header">Branch + Gshare</h1>
                </a>
                {show_subsection ? subsection_comp : null}
            </div>
        </div>
    );
};

export default BranchGshare;
