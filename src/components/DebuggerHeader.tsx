"use client";
import Link from "next/link";
import { ArrowUUpLeft } from "phosphor-react";
import "./DebuggerHeader.css";
import CycleNavigation from "./CycleNavigation";
import NSToggle from "./NSToggle";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@headlessui/react";
import Image from "next/image";
import icon_img from "../../public/apple-touch-icon.png";
import { NumberSystem } from "@/app/debugger/page";
import React from "react";
// Additional header stuff for the debugger page
const DebuggerHeader: React.FC<{
    file_name: string;
    cur_cycle: number;
    end_cycle_index: number;
    include_neg: boolean;
    selected_number_sys: NumberSystem;
    negFlipHandler: () => void;
    cycleHandler: (cycle: number) => void;
    numberSysHandler: (number_system: NumberSystem) => void;
}> = ({
    file_name,
    cur_cycle,
    end_cycle_index,
    include_neg,
    selected_number_sys,
    negFlipHandler,
    cycleHandler,
    numberSysHandler,
}) => {
    const router = useRouter();
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "b") {
                router.push("/");
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, []);

    return (
        <div className="debugger-header">
            {/* Button to go back */}
            <Link href="/" className="btn btn-babyblue">
                <ArrowUUpLeft size={25} weight="bold" />
            </Link>

            <Image src={icon_img} alt="icon" width={30} height={30}></Image>
            <h1
                className="text-lg font-bold pr-1 border-r-2 "
                style={{ borderColor: "var(--foreground)" }}
            >
                VCDive
            </h1>
            <h2 className="font-bold" style={{ color: "var(--color-primary)" }}>
                {file_name}
            </h2>

            <CycleNavigation
                cur_cycle={cur_cycle}
                end_cycle_index={end_cycle_index}
                cycleHandler={cycleHandler}
            />
            <h4 className="flex flex-col absolute right-[220px]">
                Current Cycle
                <span className="ml-auto relative ">
                    {cur_cycle} / {end_cycle_index}
                </span>
            </h4>

            <div className="absolute right-[130px] flex gap-x-1">
                <Switch
                    checked={include_neg}
                    onChange={negFlipHandler}
                    className="group inline-flex h-6 w-11 items-center rounded-full bg-accent transition data-[checked]:bg-primary"
                >
                    <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                </Switch>
                <p className="text-center">neg</p>
            </div>
            <NSToggle
                selected_number_sys={selected_number_sys}
                numberSysHandler={numberSysHandler}
            />
        </div>
    );
};

export default React.memo(DebuggerHeader);
