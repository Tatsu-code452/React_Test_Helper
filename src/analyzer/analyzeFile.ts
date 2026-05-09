import { extract } from "../extract/extract";
import fileManager from "../helper/fileManager";
import type { FileAnalysis } from "../types/types";

export const analyzeFile = (filePath: string): FileAnalysis => {
    const source = fileManager.read(filePath);
    return extract(filePath, source);
};

