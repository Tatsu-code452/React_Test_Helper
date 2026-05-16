import { StateMachine } from "../../model";
import { parseEvent } from "./parseEvent";
import { parseExpect } from "./parseExpect";

export const parseDslTables = (text: string): Record<string, StateMachine[]> => {
    const groups: Record<string, StateMachine[]> = {};
    let currentGroup = "";
    let buffer: string[] = [];

    const lines = text.split("\n");

    for (const raw of lines) {
        const line = raw.trim();

        // グループ見出し検出（##, ###, #### などすべて許可）
        if (/^#{2,}\s/.test(line)) {
            if (currentGroup && buffer.length > 0) {
                groups[currentGroup] = parseDslRows(buffer);
                buffer = [];
            }
            currentGroup = line.replace(/^#{2,}\s*/, "").trim();
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

const isDslRow = (line: string) =>
    line.trim().startsWith("|") &&
    !line.startsWith("| State") &&
    !line.startsWith("| ---");

const parseDslRows = (lines: string[]): StateMachine[] => {
    return lines
        .map(parseDslRow)
        .filter((row): row is StateMachine => row !== undefined);
};

const parseDslRow = (line: string): StateMachine | undefined => {
    const cols = line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

    if (cols.length < 5) return undefined;

    const [state, eventText, result, nextState, expectText] =
        cols.slice(0, 5) as [string, string, StateMachine["result"], string, string];

    const event = parseEvent(eventText);
    const expect = parseExpect(expectText);

    if (!event) return undefined;

    return {
        state,
        event,
        result,
        nextState,
        ...(expect !== undefined && { expect }),
    };
};
