import { program } from "commander";
import { Chalk } from "chalk";
import * as fs from "fs";
import { select, input, confirm } from "@inquirer/prompts";
import { createSpinner } from "nanospinner";
import { stepMain } from "./steps/main.js";
import { config } from 'dotenv';
import { GEMINI_API_KEY, setAPIKey } from "./misc/key.js";

config();
setAPIKey(process.env.GEMINI_API_KEY)
export const version = "1.0.3";
const chalk = new Chalk();
program
  .name("localelinter")
  .description(
    "Lints locale files for spelling, grammar, and other issues using the Google Gemini API."
  )
  .version(version)
  .option("-d, --directory [value]", "The directory of the locale files")
  .option("-ft, --filetype [value]", "The file type to check (default: json)")
  .option("-y, --yes", "Auto confirm configuration.")
  .option("-e, --code", "Use this to have the program exit with code 1 when changes are required.")
  .option("-n, --nosave", "Disables the save changes prompt.")
  .option("-a, --autosave", "Automaticly saves changes (SCARY)")
  .option("-t, --delay [value]", "Delay between each API request (default 200(MS))")
  .option("-k, --key [value]", "The API key to use (default: loaded from env.GEMINI_API_KEY)")
  .option("--llmnote [value]", "Add a note of context for the LLM.")
program.parse();

console.log(
  `${chalk.magenta("localelinter")} ${chalk.gray(`(v${version})`)}`
);

const options = program.opts() as {
  directory?: string;
  filetype?: string; 
  yes?: boolean;
  code: boolean;
  nosave: boolean;
  autosave: boolean;
  delay: number;
  key: string | undefined;
  llmnote: string;
};
if (options.key) {
  setAPIKey(options.key);
}
if (GEMINI_API_KEY == undefined) {
  console.log(chalk.bgRed.white("Gemini API key required, pass one with --key <apikey> or set it as an environment variable.\nGet one for free here: https://aistudio.google.com/app/apikey"))
  process.exit(1);
}
stepMain(options);
