#!/usr/bin/env node

/*
 * Copyright (c) 2024 JewelEyed
 * MIT License
 */
import { program } from "commander";
import { Chalk } from "chalk";
import { stepMain } from "./steps/main.js";
import { config } from 'dotenv';
config();
export const version = "1.0.1";
const chalk = new Chalk();
program
    .name("localelinter")
    .description("Lints locale files for spelling, grammar, and other issues using the Google Gemini API.")
    .version(version)
    .option("-d, --directory [value]", "The directory of the locale files")
    .option("-ft, --filetype [value]", "The file type to check (default: json)")
    .option("-y, --yes", "Auto confirm configuration.")
    .option("-e, --code", "Use this to have the program exit with code 1 when changes are required.")
    .option("-n, --nosave", "Disables the save changes prompt.")
    .option("-a, --autosave", "Automaticly saves changes (SCARY)")
    .option("-t, --delay [value]", "Delay between each API request (default 200(MS))")
    .option("-k, --key [value]", "The API key to use (default: loaded from env.GEMINI_API_KEY)")
    .option("--llmnote [value]", "Add a note of context for the LLM.");
program.parse();
console.log(`${chalk.magenta("localelinter")} ${chalk.gray(`(v${version})`)}`);
const options = program.opts();
if (options.key) {
    process.env["GEMINI_API_KEY"] = options.key;
}
if (!process.env.GEMINI_API_KEY) {
    console.log(chalk.bgRed.white("Gemini API key required, pass one with --key <apikey> or set it as an environment variable.\nGet one for free here: https://aistudio.google.com/app/apikey"));
    process.exit(1);
}
stepMain(options);
