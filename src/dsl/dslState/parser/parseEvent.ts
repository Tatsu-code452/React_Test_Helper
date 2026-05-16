import { Event } from "../../model";

export const parseEvent = (dsl: string): Event | undefined => {
    const parts = dsl.split(":");

    if (parts.length < 3) return undefined;
    const [type, target, name] = parts.slice(0, 3) as [Event["type"], Event["target"], string];

    if (type === "keydown") {
        return {
            type,
            target,
            name,
            key: parts[3] ?? ""
        };
    }

    return { type, target, name };
};
