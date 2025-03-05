import { Instruction } from "./rvcodec.js/Instruction";

export interface DisplayInstruction {
    instruction: number;
    asm: string;
    hex: string;
    valid: boolean;
}

export const parse_instruction = (instruction: number): DisplayInstruction => {
    const hexadecimal_string = instruction.toString(16).padStart(8, "0");
    try {
        const inst = new Instruction(hexadecimal_string);
        return {
            instruction: instruction,
            asm: inst.toString(),
            hex: hexadecimal_string,
            valid: true,
        }
    }
    catch {
        return {
            instruction: instruction,
            asm: "Invalid instruction",
            hex: hexadecimal_string,
            valid: false,
        }
    }
}

export const convert_reg_hex_to_dec = (reg_hex: string) => {
  const reg_dec = parseInt(reg_hex, 16);
  return reg_dec;
};