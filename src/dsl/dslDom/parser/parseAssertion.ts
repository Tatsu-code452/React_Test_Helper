import { Assertion, AssertionValue } from "../../model";
import { toSplitCols } from "../../utils/utils";

export const parseAssertion = (text: string): Assertion[] => {
    const parts = toSplitCols(text, ",");

    return parts.map((exp) => {
        const cols = toSplitCols(exp, ":");

        if (cols.length === 2) {
            const [type, value] = cols as [KeysWithoutName, string];
            return toAssertionWithoutName[type]({ value } as any);
        }

        if (cols.length === 3) {
            const [type, name, value] = cols as [KeysWithName, string, string];
            return toAssertionWithName[type]({ name, value } as any);
        }

        throw new Error(`Invalid expect format: ${exp}`);
    });
};

type KeysWithName = "input" | "select" | "button" | "role";
type KeysWithoutName = "button" | "row" | "text" | "role";

type ConvWithName = (p: { name: string; value: unknown }) => Assertion;
type ConvWithoutName = (p: { value: unknown }) => Assertion;

const toAssertionWithName: { [K in KeysWithName]: ConvWithName } = {
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
        visible: true,
    }),
};

const toAssertionWithoutName: { [K in KeysWithoutName]: ConvWithoutName } = {
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
