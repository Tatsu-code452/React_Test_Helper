import path from "path";
import { FileMeta } from "../../types/meta";

export const extractMeta = (filePath: string): FileMeta => {
    return {
        filePath,
        fileName: path.basename(filePath),
        dirName: path.dirname(filePath),
        extension: path.extname(filePath),
    };
};
