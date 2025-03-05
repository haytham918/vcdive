import { Instruction } from "./rvcodec.js/Instruction";

export interface DisplayInstruction {
    asm: string;
    hex: string;
    valid: boolean;
}

export const parseInstruction = (instruction: number): DisplayInstruction => {
    const hexadecimal_string = instruction.toString(16).padStart(8, "0");
    try {
        const inst = new Instruction(hexadecimal_string);
        return {
            asm: inst.toString(),
            hex: hexadecimal_string,
            valid: true,
        }
    }
    catch (error) {
        return {
            asm: "Invalid instruction",
            hex: hexadecimal_string,
            valid: false,
        }
    }
}
