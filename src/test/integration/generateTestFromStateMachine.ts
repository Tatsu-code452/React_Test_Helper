import { createFileWithDir } from "../../helper/fileManager";

// Phase 1: DSL → JSON（完了）
// Phase 2: JSON → 実行エンジン（イベント実行 & DOM アサート）
// Phase 3: JSON → Mermaid（可視化）
// Phase 4: JSON → テストコード生成（Vitest + RTL）
// Phase 5: 自動実行（CI/CD）

type Transition = {
    state: string;
    event: string;
    call: string | null;
    result: "SUCCESS" | "FAIL" | "CANCEL" | "NOOP";
    next: string;
};

export type StateMachine = Record<string, Transition[]>;

export const generateTestFromStateMachine = (fsm: StateMachine) => {
    const testCases = [];

    testCases.push(generateImports());
    for (const [stateName, transitions] of Object.entries(fsm)) {
        for (const t of transitions) {
            const testCode = generateTestCase(stateName, t);
            testCases.push(testCode);
        }
    }

    createFileWithDir("__output__\\__test__", `integration.test.tsx`, testCases.join("\n\n"));
}

const generateImports = (): string => {
    return `
import { initialize, mockApiData } from "./initializeApiMock";
initialize();
mockApiData();

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Target } from "./imports";
`.trim();
}

const generateTestCase = (stateName: string, t: Transition): string => {
    return `
describe("${stateName} → ${t.next}", () => {
  it("${t.event} triggers ${t.call ?? "NOOP"}", async () => {

    // Arrange
    render(<Target />);

    // Act
    ${eventToUserEvent(t.event)}

    // Assert
    ${nextStateToDomCheck(t.next)}
  });
});
`;
}

const eventToUserEvent = (event: string): string => {
    const [type, elementType, elementValue, value] = event.split(":");
    const el = getElement(elementType, elementValue);
    switch (type) {
        case "click":
            return `await userEvent.click(${el});`;
        case "keydown":
            return `
await userEvent.click(${el});
await userEvent.keyboard("${value}");`.trim();
        case "change":
            return `await userEvent.type(${el}, "${value}")`;
        case "blur":
            return `
await userEvent.click(${el});
await userEvent.tab();`.trim();
        default:
            return "// TODO: unknown event";
    }
}

const getElement = (elementType?: string, elementValue?: string): string | undefined => {
    switch (elementType) {
        case "text": return `await screen.findByText("${elementValue}")[0]`;
        case "label": return `await screen.findByLabelText("${elementValue}[0]")`;
    }
    return undefined;
}

const nextStateToDomCheck = (next: string): string => {
    switch (next) {
        case "ShowAlert":
            return `expect(window.alert).toHaveBeenCalled()`;
        default:
            return `// TODO: DOM check for state: ${next}`;
    }
}

