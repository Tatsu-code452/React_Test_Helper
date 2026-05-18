import { Domain, DomainKeys, Expect } from "../../model";
import { isTargetKey, sliceCols, toSplitCols } from "../../utils/utils";

export const parseExpect = (dsl: string): Expect | undefined => {
    const parts = sliceCols(toSplitCols(dsl, ":"), 2);
    if (!parts) return undefined;

    const [domain, state] = parts;
    if (!isTargetKey<Domain>(domain, DomainKeys) || !state) return undefined;

    return { domain, state };
};
