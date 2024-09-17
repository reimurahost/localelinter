import { select, input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { version } from "../index.js";
import fs from "fs";
import { lint } from "./lint.js";

let foundFiles: {
  absolute_path: string;
  relative_path: string;
}[] = [];
let directoryToCheck: string;

async function selectDirectory(workingDirectory: string) {
  const directories = fs
    .readdirSync(workingDirectory)
    .filter((item) =>
      fs.lstatSync(`${workingDirectory}/${item}`).isDirectory()
    );

  const answer = await select({
    message: `${chalk.magentaBright(
      "Which directory do you want to lint? (select root for a sub-directory)"
    )}`,
    choices: [
      { name: "current (.)", value: workingDirectory },
      ...directories.map((dir) => {
        return {
          name: dir,
          value: workingDirectory.endsWith("/")
            ? workingDirectory + dir
            : workingDirectory + "/" + dir,
        };
      }),
    ],
  });
  if (answer == workingDirectory) {
    return workingDirectory;
  } else {
    console.log(`${chalk.gray(`${answer}`)}`);
    return selectDirectory(answer);
  }
}
function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (!file.isDirectory()) {
      foundFiles.push({
        absolute_path: `${dir}/${file.name}`,
        relative_path: `${dir}/${file.name}`.replace(
          `${directoryToCheck}/`,
          ""
        ),
      });
    } else {
      scanDirectory(`${dir}/${file.name}`);
    }
  }
}

export async function stepMain(options: any) {
  directoryToCheck = options?.directory;

  console.log(
    `${chalk.magenta("localelinter")} ${chalk.gray(`(v${version})`)}`
  );
  let cwd = process.cwd();

  if (!directoryToCheck) {
    // Get all directorys in the current directory
    directoryToCheck = await selectDirectory(cwd);
    console.log(
      `${chalk.magentaBright(`Selected directory: ${directoryToCheck}`)}`
    );
  }
  let fileTypeToCheck = options?.filetype;
  if (!fileTypeToCheck) {
    const fileTypeCheckAnswer = await select({
      message: `${chalk.magentaBright("What file type do you want to check?")}`,
      choices: [
        { name: "JSON (default)", value: "json" },
        { name: "YAML", value: "yaml" },
        { name: "Custom (input)", value: "custom" },
      ],
    });
    if (fileTypeCheckAnswer == "custom") {
      fileTypeToCheck = await input({
        message: `${chalk.magentaBright("File type to check:")}`,
      });
    } else {
      fileTypeToCheck = fileTypeCheckAnswer;
    }
  }
  console.log(
    `${chalk.magentaBright(`Selected filetype: ${fileTypeToCheck}`)}`
  );

  // Scan for files in the directory
  const checkFilesSpinner = createSpinner("Scanning for files...").start();
  foundFiles = [];
  scanDirectory(directoryToCheck);

  checkFilesSpinner.success({
    text: `${chalk.magentaBright(
      `Found ${foundFiles.length} ${
        foundFiles.length == 1 ? "file" : "files"
      } to check.`
    )}`,
  });

  console.log(
    chalk.magenta(
      ` Directory: ${directoryToCheck}
 File Count: ${foundFiles.length} (${fileTypeToCheck})`
    )
  );
  if (!options.yes) {
    const confirmed = await confirm({
      message: `${chalk.magentaBright("Does this all appear correct?")}`,
    });
    if (!confirmed) {
      stepMain(options);
    } else {
      await lint(foundFiles, options);
    }
  } else {
    await lint(foundFiles, options);
  }
}
