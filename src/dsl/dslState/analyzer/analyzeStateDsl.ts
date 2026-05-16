import { read } from "../../../helper/fileManager";
import { StateMachine } from "../../model";
import { parseDslTables } from "../parser/parseDslTables";

export const analyzeStateDsl = (filePath: string): Record<string, StateMachine[]> => {
    const text = read(filePath);
    return parseDslTables(text);
};

