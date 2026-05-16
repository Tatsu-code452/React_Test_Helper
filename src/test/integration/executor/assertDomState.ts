import { domStateMap } from "./domStateMap";

export const assertDomState = (state: string) => {
    const fn = domStateMap[state];
    if (!fn) {
        throw new Error(`Unknown DOM state: ${state}`);
    }
    fn();
};
