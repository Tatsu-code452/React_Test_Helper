import fs from "fs";
import path from "path";
import type { FileAnalysis } from "../types/types";
import { analyzeFile } from "./analyzeFile";

export const analyzeFolder = (folder: string): FileAnalysis[] => {
    const files = walkDir(folder);
    const result = files.map((f) => analyzeFile(f));
    return result;
};

const walkDir = (dir: string): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        if (entry.name === "__tests__") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkDir(full));
        } else if (isTsFile(full)) {
            files.push(full);
        }
    }
    return files;
};

const isTsFile = (file: string): boolean =>
    file.endsWith(".ts") || file.endsWith(".tsx");

