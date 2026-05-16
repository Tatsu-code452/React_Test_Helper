export type Transition = {
    state: string;
    event: string;
    result: string;
    nextState: string;
};

export function generateMermaid(transitions: Transition[]): string {
    const lines: string[] = [];
    lines.push("stateDiagram-v2");

    for (const t of transitions) {
        const { state, event, result, nextState } = t;

        // NOOP → dotted line
        if (result === "NOOP") {
            lines.push(`    ${state} -.-> ${nextState}: ${event}`);
            continue;
        }

        // 通常遷移
        lines.push(`    ${state} --> ${nextState}: ${event}`);
    }

    return lines.join("\n");
}

