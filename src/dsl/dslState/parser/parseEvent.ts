import { Event, EventKeys, EventTargets } from "../../model";
import { isTargetKey, toSplitCols } from "../../utils/utils";

export const parseEvent = (dsl: string): Event | undefined => {
    const parts = toSplitCols(dsl, ":");

    if (parts.length < 3) return undefined;
    const [type, target, name] = parts.slice(0, 3);

    if (isTargetKey<Event["type"]>(type, EventKeys) &&
        isTargetKey<Event["target"]>(target, EventTargets) &&
        name) {
        if (type === "keydown") {
            return (parts.length < 4) ?
                undefined :
                { type, target, name, key: parts[3] || "" };
        }

        return { type, target, name };
    }

    return undefined;
};
