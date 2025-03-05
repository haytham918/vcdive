import { Instruction } from "./rvcodec.js/Instruction";

export interface DisplayInstruction {
    asm: string;
    hex: string;
    valid: boolean;
}

export const parse_instruction = (instruction: number): DisplayInstruction => {
    const hexadecimal_string = instruction.toString(16).padStart(8, "0");
    try {
        const inst = new Instruction(hexadecimal_string);
        return {
            asm: inst.toString(),
            hex: hexadecimal_string,
            valid: true,
        }
    }
    catch {
        return {
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