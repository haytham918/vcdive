import { NumberSystem } from "@/app/debugger/page";
import { Instruction } from "./rvcodec.js/Instruction";

/*
        GUI Methods
*/
// ---------------------------------------------------------------
// get a cookie value
export const get_cookie = (name: string) => {
    const cookie_str = document.cookie;
    const cookies = cookie_str.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key == name) return decodeURIComponent(value);
    }
    return null;
};

// set a cookie value
export const set_cookie = (name: string, value: string, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
        value
    )}; expires=${expires}; path=/`;
};
/* ---------------------------------------------------------------*/

/*
        Debugger Methods
*/
// ---------------------------------------------------------------
export interface DisplayInstruction {
    asm: string;
    valid: boolean;
}

// Parse insturction from a binary string
export const parse_instruction = (instruction: string): DisplayInstruction => {
    try {
        const inst = new Instruction(instruction);
        console.log(inst);
        return {
            asm: inst.asm,
            valid: true,
        };
    } catch {
        return {
            asm: "Invalid",
            valid: false,
        };
    }
};

// Convert register number to decimal
export const convert_hex_to_dec = (hex: string) => {
    const dec = parseInt(hex, 16);
    return dec;
};

// Process value based on the selected number system
export const process_values = (value: string, number_system: NumberSystem) => {
    if (!value || value == "" || value == " ") return "x";
    // Remove leading zeros
    const trimmedValue = value.replace(/^0+/, "") || "0";

    if (number_system == "0d") {
        return String(parseInt(trimmedValue, 16));
    }
    return String(trimmedValue);
};

// Reverse string method
export const reverse_string = (str: string) => {
    if (str) return str.split("").reverse().join("");
    return "";
};

// Create mask segments based on "reversed" mask string
// If original string is "0001", you need to pass it as "1000" here
// Result:
/*
    Size: 2, Mask: 1011
    ==> [10, 11]
*/
export const segment_mask_table = (size: number, mask: string) => {
    const segments = [];
    if (mask) {
        let remaining_mask = mask;
        while (remaining_mask.length > 0) {
            let segment = remaining_mask.slice(0, size);
            remaining_mask = remaining_mask.slice(size);

            if (segment.length < size) {
                // We would pad 0 to the end instead
                segment.padEnd(size - segment.length, "0");
            }
            segments.push(segment);
        }
    }
    return segments;
};

// Assign if head or tail basd on index
export const head_tail_comp = (i: number, head: number, tail: number) => {
    if (head === i && tail === i) return "h&t";
    else if (head === i) return "h";
    else if (tail === i) return "t";
    return null;
};

// Assign entry color based on head, tail, index, free
export const fifo_entry_color = (
    index: number,
    head: number,
    tail: number,
    num_free: number,
    num_size: number
) => {
    if (num_free == num_size) return "";
    if (index === head) return "emerald";
    if (index === tail) return "red";
    if (num_free == 0) return "yellow";
    if (tail >= head) {
        if (index < tail && index > head) return "yellow";
    } else {
        if (index < tail || index > head) return "yellow";
    }
    return "";
};

// -----------------------------------------------------------------
