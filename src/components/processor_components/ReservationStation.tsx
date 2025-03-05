"use client";
import "./Section.css";
import { MouseEvent, useState } from "react";
// import lib/utils.ts
import { parse_instruction, convert_reg_hex_to_dec } from "@/lib/utils";

// TODO: Make this a config file parameter
const RS_SIZE = 8;
