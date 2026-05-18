import { ResultKeys, StateMachine } from "../../model";
import { isDslRow, isTargetKey, isTitle, sliceCols, toGroupName, toSplitCols } from "../../utils/utils";
import { parseEvent } from "./parseEvent";
import { parseExpect } from "./parseExpect";

export const parseDslTables = (text: string): Record<string, StateMachine[]> => {
    const groups: Record<string, StateMachine[]> = {};

    let currentGroup = "";
    let buffer: string[] = [];
    const lines = text.split("\n");

    for (const raw of lines) {
        const line = raw.trim();
        if (isTitle(line)) {
            if (currentGroup && buffer.length > 0) {
                groups[currentGroup] = parseDslRows(buffer);
                buffer = [];
            }
            currentGroup = toGroupName(line);
            continue;
        }
        if (isDslRow(line)) buffer.push(line);
    }

    // 最後のグループを確定
    if (currentGroup && buffer.length > 0) {
        groups[currentGroup] = parseDslRows(buffer);
    }

    return groups;
};

const parseDslRows = (lines: string[]): StateMachine[] => {
    return lines
        .map(parseDslRow)
        .filter((row): row is StateMachine => row !== undefined);
};

const parseDslRow = (line: string): StateMachine | undefined => {
    const cols = sliceCols(toSplitCols(line, "|"), 5);
    if (!cols) return undefined;

    const [state, eventText, result, nextState, expectText] = cols;
    if (!state || !eventText || !nextState || !expectText ||
        !isTargetKey<StateMachine["result"]>(result, ResultKeys)
    ) return undefined;

    const event = parseEvent(eventText);
    if (!event) return undefined;

    const expect = parseExpect(expectText);

    return {
        state,
        event,
        result,
        nextState,
        ...(expect !== undefined && { expect }),
    };
};
