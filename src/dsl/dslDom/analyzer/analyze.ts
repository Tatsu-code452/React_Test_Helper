import { read } from "../../../helper/fileManager";
import { DomState } from "../../model";
import { parseDomStates } from "../parser/parseDomState";

export const analyzeDomDsl = (
    filePath: string
): DomState[] => parseDomStates(read(filePath));
