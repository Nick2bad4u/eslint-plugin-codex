// @ts-check

import process from "node:process";

const chunks = [];

for await (const chunk of process.stdin) {
    chunks.push(String(chunk));
}

const packOutput = JSON.parse(chunks.join(""));
const entries = Array.isArray(packOutput)
    ? packOutput
    : typeof packOutput === "object" && packOutput !== null
      ? Object.values(packOutput)
      : [];
const [firstEntry] = entries;

if (
    typeof firstEntry !== "object" ||
    firstEntry === null ||
    !("filename" in firstEntry) ||
    typeof firstEntry.filename !== "string" ||
    firstEntry.filename.length === 0
) {
    throw new Error("npm pack --json did not return a package filename");
}

process.stdout.write(firstEntry.filename);
