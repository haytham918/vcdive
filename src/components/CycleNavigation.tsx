import "./DebuggerHeader.css"

const CycleNavigation = () => {
    return(
        <div className="cycle-navigation-container">
            <button className="btn btn-babyblue">First (a)</button>
            <button className="btn btn-babyblue">-10 (b)</button>
            <button className="btn btn-babyblue">-1 (c)</button>
            <button className="btn btn-babyblue">+1 (d)</button>
            <button className="btn btn-babyblue">+10 (e)</button>
            <button className="btn btn-babyblue">End (f)</button>
        </div>
    )

};

export default CycleNavigation;