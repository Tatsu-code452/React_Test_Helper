import { Assertion } from "../../model";

export const generateAssertFunction = (
    funcName: string,
    expects: Assertion[]
): string => {
    const lines = expects.map((e) => {
        const handler = handlers[e.type] as Handler<Extract<Assertion, { type: typeof e.type }>>;
        if (!handler) {
            throw new Error(`Unknown assertion type: ${e.type}`);
        }
        return handler(e);
    });

    return `
export const ${funcName} = () => {
  ${lines.join("\n  ")}
};
  `.trim();
};

type Handler<T extends Assertion> = (e: T) => string;

const handlers: {
    [K in Assertion["type"]]: Handler<Extract<Assertion, { type: K }>>;
} = {
    row: (e) => {
        if (e.value === "none") {
            return `expect(screen.queryAllByRole("row")).toHaveLength(0);`;
        }
        return `expect(screen.queryAllByRole("row").length).toBeGreaterThan(0);`;
    },

    text: (e) => {
        return `expect(screen.getByText("${e.value}")).toBeInTheDocument();`;
    },

    role: (e) => {
        if (e.visible) {
            return `expect(screen.getByRole("${e.name ?? "dialog"}")).toBeInTheDocument();`;
        }
        return `expect(screen.queryByRole("${e.name ?? "dialog"}")).toBeNull();`;
    },

    button: (e) => {
        const method = e.enabled ? "toBeEnabled" : "toBeDisabled";
        return `expect(screen.getByRole("button", { name: "${e.name}" })).${method}();`;
    },

    input: (e) => {
        if (e.value === "empty") {
            return `expect(screen.getByLabelText("${e.name}")).toHaveValue("");`;
        }
        return `expect(screen.getByLabelText("${e.name}")).not.toHaveValue("");`;
    },

    select: (e) => {
        if (e.value === "empty") {
            return `expect(screen.getByLabelText("${e.name}")).toHaveValue("");`;
        }
        return `expect(screen.getByLabelText("${e.name}")).not.toHaveValue("");`;
    },
};
