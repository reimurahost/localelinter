import { Spinner, createSpinner } from "nanospinner";
import * as fs from "fs";
import chalk from "chalk";
import { confirm } from "@inquirer/prompts";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    'You will be given a localization file. This file may take many forms such as JSON or YAML. Your job is to perform spellchecking (and grammar correction if they request it) on this file. Never correct capitalization. Don\'t change punctuation (like swapping an exclamation mark for a period, or adding a period to the end of a sentance). Your response should only ever be an array of JSON, nothing else. You should be hesitant to make changes, as context is often missing from the file. If you do not belive a change is 100% necessary, do not make it. \nMost files will look something like this:\n[a key, never change this]: [a value, this is what you should be correcting]\nHeres an example file in JSON:\n{\n    "key": "value",\n    "key2": "value",\n    "key.three": "value"\n}\nHeres an example file in YAML:\nkey1: value1\nkey2: value2\n \nYou must respond in this exact format:\n[\n    {\n        "original": <the string on the line that needs to be replaced, if the word is in multiple places, include surrounding words, do this with the corrected string as well>,\n        "corrected": <a string>,\n        "explanation": <the reason for the change>\n    },\n    <this is an array>\n]\nHere is an example of what not to do:\n{\n    "homepage.owner": "JewelEyed",\n    "dashboard.title": "Dashboard",\n    "dashboard.safetoclose": "You may now close this page.",\n    "dashboard.error": "%s is not valid.",\n    "dashboard.viewfooter": "View Footer"\n}\nYour Response:\n[\n    {\n        "original": ".safetoclose" // Never do this, you are only correcting what comes after the colon or equals sign.\n        "corrected": ".safe.to.close",\n        "explanation":  "\\\\"safetoclose\\\\" is the correct spelling of  \\\\"safe.to.close\\\\"" // Once again do not do this\n    },\n    {\n        "original": "%s is not valid.",\n        "corrected": "That is not valid.", // do not change/modify/edit any form of variable EVER, you are only correcting spelling and grammar. Variables often look like this {{ a_variable }} or %s or my_variable_1.\n        "explanation": "%s is not a word" // do not change the word %s (or anything like it), that is a variable\n    }\n]\nEND WHAT NOT TO DO\n\nNote: // is only used in examples, do not include comments in actual responses.\nNote: Make sure to include commas at the end of lines in your responses so they are valid JSON.\nNote: Most files you will encounter will not require any corrections, when you encounter one of these files, just respond with an empty array.\n\nHere are some examples of what you should do!\nExample 1:\nRequested Changes:\n - Check spelling\n - Check grammar\n{\n    "homepage.title": "My coool website",\n    "homepage.subtitle": "Welcome to my website!",\n    "signin" :"Sign In",\n    "signin.magic": "Sign in via Magic"\n}\nYour Response:\n[\n    {\n        "original": "coool"\n        "corrected": "cool",\n        "explanation":   "\\\\"coool\\\\" is the correct spelling of \\\\"cool\\\\""\n    }\n]\nExplanation of example 1:\nThe file should be using the word \'cool\'.\n\nExample 2:\nRequested Changes:\n - Check spelling\n - Check grammar\n{\n    "title": "2 Factor Authentication",\n    "factor": "Factor:",\n    "code": "Verification Code:",\n    "verify": "Verify",\n    "entercode": "Enter the code from you\'re two factor authentication app",\n    "error.nototp": "No TOTP factors found!"\n}\nYour Response:\n[\n    {\n        "original": "2 Factor"\n        "corrected": "Two-Factor",\n        "explanation":  "\\\\"Two-Factor\\\\" should be a word and not a number."\n    },\n    {\n        "original": "two factor",\n        "corrected": "two-factor",\n        "explanation": "\'two factor\' should have a hyphen between the words \'factor\' and \'two\'"\n    }\n]\nExplanation of example 2:\nThe file should be using a hyphen between \'two\' and \'factor\'. entercode is wrong, but should not be corrected because it is a key (because its before a colon or equals sign)\n\nExample 3:\nRequested Changes:\n - Check spelling\n - Do not correct grammar\nemail.label=Enter your email address\nemail.placeholder=janedoe@example.com\npassword.label=Enter your password\npassword.placeholder=********\nlogin.button=Login\nlogin.forgotpass=Forgot Password?\nlogin.signup=Don\'t have an account? Sign up!\nYour Response:\n[]\nExplanation of example 3:\nThere are no changes to be made.\n\nExample 4:\nRequested Changes:\n - Check spelling\n - Check grammar\nsettings:\n    title: Settings\n    subtitle: Change your settings\nlanguage:\n    label: Language\n    placeholder: Select a language\ntheme:\n    label: Theme\n    placeholder: Select a theme\nerror:\n    message: Uh oh! Normaly this doesn\'t happen...\nYour Response:\n[\n    {\n        "original": "normaly"\n        "corrected": "normally",\n        "explanation": "\\\\"normally\\\\" is the correct spelling of \\\\"normaly\\\\""\n    }\n]\nExplanation of example 4:\nOnly the word \\"normally\\" needed to be corrected.\nExample 5:\nRequested Changes:\n - Check spelling\n - Check grammar\n{\n   "subscribe": "Subscribe",\n   "cancel": "Cancel",\n   "learnmore": "Learn more..."\n}\nYour response:\n[]\nExplanation of example 5:\nNo changes are needed for this file. Most files will not require any corrections. Do not make unnecessary ones.\n\nEND OF EXAMPLES',
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  stopSequences: ["END DIFF"],
  responseMimeType: "text/plain",
};

export async function lint(
  files: {
    absolute_path: string;
    relative_path: string;
  }[],
  options: any
) {
  const lintSpinner = createSpinner("Linting files").start();
  let changes: {
    original_file_contents: string;
    new_file_contents: string;
    relative_path: string;
    absolute_path: string;
  }[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) {
      console.log(chalk.redBright(`WARN: Failed to locate a file.`));
      continue;
    }
    const lintRes = await lintFile(
      file,
      lintSpinner,
      {
        current: i + 1,
        total: files.length,
      },
      options
    );
    if (lintRes) {
      changes.push({
        original_file_contents: lintRes.original_file_contents,
        new_file_contents: lintRes.new_file_contents,
        relative_path: file.relative_path,
        absolute_path: file.absolute_path,
      });
    }
  }
  lintSpinner.success({
    text: `Linting complete.`,
  });
  let issueCount = 0;
  for (const change of changes) {
    let diffString = "";
    const og_by_line = change.original_file_contents.split("\n");
    const new_by_line = change.new_file_contents.split("\n");
    for (let i = 0; i < og_by_line.length && i < new_by_line.length; i++) {
      const ogLine = og_by_line[i];
      const newLine = new_by_line[i] || "";
      if (ogLine !== newLine) {
        issueCount++;
        diffString += `${chalk.bgRed.white(
          "- " + ogLine
        )}\n${chalk.bgGreen.white("+ " + newLine)}\n`;
      }
    }
    if (diffString !== "") {
      console.log(chalk.bgBlack.white(` ${change.relative_path} - Changes: `));
      console.log(diffString);
      if (!options.code && !options.nosave && !options.autosave) {
        const saveChange = await confirm({
          message: `Would you like to save these changes?`,
          default: true,
        });
        if (saveChange) {
          console.log(chalk.bgGreen.white(`\n  ✔ Saved Changes  `));
          fs.writeFileSync(change.absolute_path, change.new_file_contents);
        }
      }
      if (options.autosave) {
        console.log(chalk.bgGreen.white(`\n  ✔ Saved Changes  `));
        fs.writeFileSync(change.absolute_path, change.new_file_contents);
      }
    } else {
      console.log(
        chalk.bgBlack.white(` No changes found in ${change.relative_path} `)
      );
    }
  }
  if (issueCount > 0 && options.code) {
    console.log(chalk.bgRed.white(`\n  Found ${issueCount} issues.  `));
    process.exit(1);
  }
}

async function lintFile(
  file: {
    absolute_path: string;
    relative_path: string;
  },
  spinner: Spinner,
  progress: {
    current: number;
    total: number;
  },
  options: any
) {
  spinner.update({
    text: `Linting file ${file.relative_path} (${progress.current}/${progress.total})`,
  });
  const fileContents = fs.readFileSync(file.absolute_path, "utf-8");
  await new Promise<void>((res) => {
    setTimeout(() => res(), options.delay || 200);
  });
  const history = [
    ...(options.llmnote
      ? [
          {
            role: "user",
            parts: [
              {
                text:
                  "Before you start processing files, here are some notes and additional instructions.\n" +
                  options.llmnote,
              },
            ],
          },
          {
            role: "model",
            parts: [{ text: "understood" }],
          },
        ]
      : []),
  ];
  //console.log(JSON.stringify(history));
  const chatSession = model.startChat({
    generationConfig,
    history: history,
  });
  const generateResponse = await chatSession.sendMessage(fileContents);
  // Lets try to parse this
  try {
    const parsed = JSON.parse(generateResponse.response.text());
    if (!Array.isArray(parsed)) {
      console.log(chalk.redBright(`WARN: Failed to parse array from Gemini.`));
      return;
    }
    let newFileContents = fileContents;
    for (const correction of parsed) {
      if (fileContents.includes(correction.original)) {
        console.log(
          chalk.gray(
            `\nFound correction: ${correction.original} -> ${correction.corrected}`
          )
        );
        newFileContents = newFileContents.replace(
          correction.original,
          correction.corrected
        );
      } else {
        console.log(
          chalk.redBright(
            `\nWARN: LLM halucinated non existant correction, you may want to switch settings.`
          )
        );
      }
    }
    return {
      original_file_contents: fileContents,
      new_file_contents: newFileContents,
    };
  } catch {
    console.log(
      chalk.redBright(
        `\nWARN: Failed to parse response from Gemini. Retrying.\n${generateResponse.response.text()}`
      )
    );
    //return await lintFile(file, spinner, model, progress);
  }
}
