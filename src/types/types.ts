import { FileMeta } from "./meta";
import { SourceStructure } from "./source";
import { UIAnalysis } from "./ui";

export type FileAnalysis = {
    meta: FileMeta;
    source: SourceStructure;
    ui: UIAnalysis;
};
