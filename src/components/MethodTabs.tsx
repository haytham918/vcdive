"use client";
import "./MethodTabs.css";
import { Method, MethodOption } from "@/app/page";
import React from "react";
const MethodTabs: React.FC<{
    available_methods: MethodOption[];
    chosen_method: Method;
    chosen_method_handler: (method: Method) => void;
}> = ({ available_methods, chosen_method, chosen_method_handler }) => {
    return (
        <div className="tabs-container">
            {available_methods.map((method) => (
                <button
                    className={`btn w-[100px] flex flex-row ${
                        chosen_method === method.value
                            ? "btn-babyblue"
                            : "btn-nonselect"
                    }`}
                    onClick={() => chosen_method_handler(method.value)}
                    key={method.value}
                >
                    {method.label}
                    {method.icon}
                </button>
            ))}
        </div>
    );
};

export default React.memo(MethodTabs);
