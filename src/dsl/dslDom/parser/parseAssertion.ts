import { Assertion, AssertionValue } from "../../model";
import { isTargetKey, toSplitCols } from "../../utils/utils";

const KeysWithName = ["input", "select", "button", "role"] as const;
const KeysWithoutName = ["button", "row", "text", "role"] as const;
type KeysWithNameType = typeof KeysWithName[number];
type KeysWithoutNameType = typeof KeysWithoutName[number];
type ConvWithName = { [K in KeysWithNameType]:
    (p: { name: string; value: unknown }) => Assertion };
type ConvWithoutName = { [K in KeysWithoutNameType]:
    (p: { value: unknown }) => Assertion };

export const parseAssertion = (text: string): Assertion[] => {
    const parts = toSplitCols(text, ",");

    return parts.map((exp) => {
        const cols = toSplitCols(exp, ":");

        if (cols.length === 2) {
            const [type, value] = cols;
            if (isTargetKey<KeysWithoutNameType>(type, KeysWithoutName))
                return toAssertionWithoutName[type]({ value });
        }

        if (cols.length === 3) {
            const [type, name, value] = cols;
            if (isTargetKey<KeysWithNameType>(type, KeysWithName))
                return toAssertionWithName[type]({ name: name || "", value: value });
        }

        throw new Error(`Invalid expect format: ${exp}`);
    });
};

const toAssertionWithName: ConvWithName = {
    input: (p) => ({
        type: "input",
        name: p.name,
        value: p.value as AssertionValue<"input">["value"],
    }),

    select: (p) => ({
        type: "select",
        name: p.name,
        value: p.value as AssertionValue<"select">["value"],
    }),

    button: (p) => ({
        type: "button",
        name: p.name,
        enabled: p.value === "enabled",
    }),
    role: (p) => ({
        type: "role",
        name: "dialog",
        visible: p.value !== "none",
    }),
};

const toAssertionWithoutName: ConvWithoutName = {
    button: (p) => ({
        type: "button",
        name: p.value as AssertionValue<"button">["name"],
        enabled: true,
    }),
    row: (p) => ({
        type: "row",
        value: p.value as AssertionValue<"row">["value"],
    }),

    text: (p) => ({
        type: "text",
        value: p.value as AssertionValue<"text">["value"],
    }),

    role: (p) => ({
        type: "role",
        name: "dialog",
        visible: p.value !== "none",
    }),
};
