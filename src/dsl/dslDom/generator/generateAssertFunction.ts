import { Assertion, AssertionKey, AssertionKeys } from "../../model";
import { expectDisabled, expectEnabled, expectExists, expectNotExists, expectNotValue, expectValue, testWrapper } from "../../utils/testWrapper";
import { isTargetKey } from "../../utils/utils";

export const generateAssertFunction = (
    funcName: string,
    expects: Assertion[]
): string => {
    const lines = expects.map((e) => {
        if (isTargetKey<AssertionKey>(e.type, AssertionKeys)) {
            const handler = handlers[e.type];
            return handler(e as any);
        }
    });

    return `
export const ${funcName} = () => {
  ${lines.join("\n  ")}
};
  `.trim();
};

type AssertionParam<K extends AssertionKey> = Extract<Assertion, { type: K }>;
type AssertionMap = {
    [K in AssertionKey]: AssertionParam<K>;
};
type HandlerMap = {
    [K in AssertionKey]: (e: AssertionMap[K]) => string;
};

const handlers: HandlerMap = {
    row: (e) => {
        const expr = testWrapper.queryAllByRole("row");
        return e.value === "none"
            ? `expect(screen.${expr}).toHaveLength(0);`
            : `expect(screen.${expr}.length).toBeGreaterThan(0);`;
    },

    text: (e) => {
        const expr = testWrapper.getByText(e.value);
        return expectExists(expr);
    },

    role: (e) => {
        const expr = testWrapper.getByRole("dialog");
        return e.visible ? expectExists(expr) : expectNotExists(expr);
    },

    button: (e) => {
        const expr = testWrapper.getByRole("button", e.name);
        return e.enabled ? expectEnabled(expr) : expectDisabled(expr);
    },

    input: (e) => {
        const expr = testWrapper.getByLabelText(e.name);
        return e.value === "empty"
            ? expectValue(expr, "")
            : expectNotValue(expr, "");
    },

    select: (e) => {
        const expr = testWrapper.getByLabelText(e.name);
        return e.value === "empty"
            ? expectValue(expr, "")
            : expectNotValue(expr, "");
    },
};
