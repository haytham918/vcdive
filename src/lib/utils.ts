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
    };
  } catch {
    return {
      instruction: instruction,
      asm: "Invalid instruction",
      hex: hexadecimal_string,
      valid: false,
    };
  }
};

export const convert_reg_hex_to_dec = (reg_hex: string) => {
  const reg_dec = parseInt(reg_hex, 16);
  return reg_dec;
};

export const hexStringToNumber = (hex: string) => {
  return parseInt(hex, 16);
};

export const hexStringToMask = (hex: string, length: number = 32) => {
  return parseInt(hex, 16).toString(2).padStart(length, "0");
};

/**
 * Segments a binary/hex mask string into chunks of specified size, processing right-to-left.
 *
 *
 * This function takes a binary mask string (representing register states or bit flags)
 * and divides it into fixed-width chunks for easier visualization, starting from the
 * least significant bits (rightmost). Each chunk is padded with leading zeros if needed.
 *
 * @param {number} size - The size of each segment
 * @param {string} mask - The binary/hex mask string to be segmented
 * @returns {string[]} An array of segments, each of length 'size', ordered from least significant (right-most) to most significant
 *
 * @example
 * // Returns ["0001", "1100"]
 * segmentBitMaskRightToLeft(4, "11000001")
 *
 * @example
 * // Returns [] (empty array for empty input)
 * segmentBitMaskRightToLeft(8, "")
 *
 * @example
 * // Returns ["001"] (properly pads if segment is shorter than size)
 * segmentBitMaskRightToLeft(3, "1")
 */
export const segmentBitmaskRightToLeft = (size: number, mask: string) => {
  if (!mask) return [];

  const segments = [];
  for (let i = mask.length; i > 0; i -= size) {
    const start = Math.max(0, i - size);
    const segment = mask.substring(start, i).padStart(size, "0");
    segments.push(segment);
  }

  return segments;
};

export const reverseStr = (str: string) => {
  return str.split("").reverse().join("");
};
