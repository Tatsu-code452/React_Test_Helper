import { Expect } from "../../model";

export const parseExpect = (dsl: string): Expect | undefined => {
    const parts = dsl.split(":");
    if (parts.length < 2) return undefined;
    const [domain, state] = parts.slice(0, 2) as [Expect["domain"], Expect["state"]];
    return { domain, state };
};
