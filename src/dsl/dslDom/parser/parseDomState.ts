import { Domain, DomState } from "../../model";
import { getLinesWithTrim, isDslRow, isTitle, toGroupName, toSplitCols } from "../../utils/utils";
import { parseAssertion } from "./parseAssertion";

export const parseDomStates = (text: string): DomState[] => {
    const domStates: DomState[] = [];
    let currentDomain = "";

    const lines = getLinesWithTrim(text);

    for (const line of lines) {
        if (isTitle(line)) {
            currentDomain = toGroupName(line);
            continue;
        }

        if (isDslRow(line)) {
            const domState = parseDomState(currentDomain as Domain, line);
            domState && domStates.push(domState);
        }
    }

    return domStates;
};

const parseDomState = (domain: Domain, line: string): DomState | undefined => {
    const cols = toSplitCols(line, "|");

    if (cols.length < 2) return undefined;

    const [state, expect] = cols.slice(0, 2) as [string, string];

    return {
        domain,
        state,
        assertions: parseAssertion(expect),
    };
};

