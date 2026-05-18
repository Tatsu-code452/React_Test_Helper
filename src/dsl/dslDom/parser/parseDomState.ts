import { Domain, DomainKeys, DomState } from "../../model";
import { getLinesWithTrim, isDslRow, isTargetKey, isTitle, sliceCols, toGroupName, toSplitCols } from "../../utils/utils";
import { parseAssertion } from "./parseAssertion";

export const parseDomStates = (text: string): DomState[] => {
    const domStates: DomState[] = [];
    const lines = getLinesWithTrim(text);

    let currentDomain = "";
    for (const line of lines) {
        if (isTitle(line)) {
            const group = toGroupName(line);
            if (isTargetKey<Domain>(group, DomainKeys)) {
                currentDomain = group;
                continue;
            }
        }

        if (isDslRow(line) && isTargetKey<Domain>(currentDomain, DomainKeys)) {
            const domState = parseDomState(currentDomain, line);
            domState && domStates.push(domState);
        }
    }

    return domStates;
};

const parseDomState = (domain: Domain, line: string): DomState | undefined => {
    const cols = sliceCols(toSplitCols(line, "|"), 2);

    if (cols) {
        const [state, expect] = cols;
        return {
            domain,
            state: state || "",
            assertions: parseAssertion(expect || ""),
        };
    }

    return undefined;

};

