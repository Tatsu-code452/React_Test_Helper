import { read } from "../helper/fileManager";
import { extract } from "./extract/extract";
import type { FileAnalysis } from "./types/types";

export const analyzeFile = (filePath: string): FileAnalysis => {
    const source = read(filePath);
    return extract(filePath, source);
};

