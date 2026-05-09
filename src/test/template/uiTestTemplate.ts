import { UIElementInfo } from "../types/ui";

type ParsedComponent = {
    file: string;
    exports: { named: string[] };
    ui: UIElementInfo[];
};

export default function uiTestTemplate(component: ParsedComponent) {
    const componentName = component.exports.named[0];
    const mockName = `${componentName}Mock`;

    const tests = component.ui
        .map((el) => generateTestsForElement(el, mockName, "root"))
        .join("\n\n");

    return `
import {
  expectElement,
  getChildElement,
  setup,
} from "./${componentName}Mock";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ${componentName} } from "./../../ui/${componentName}";
import { ${mockName} } from "./mock";

describe("${componentName} UI", () => {
    let root: HTMLElement;

    beforeEach(() => {
        setup();

        const { container } = render(
            <MemoryRouter>
                <${componentName} {...${mockName}} />
            </MemoryRouter>,
        );
        root = container.querySelector("div")!;
    });

${indent(tests, 1)}
});
`.trim();
}

function generateTestsForElement(
    el: UIElementInfo,
    mockName: string,
    path: string,
    index?: number,
): string {
    const tests: string[] = [];

    // 条件式がある場合は状態遷移テストを生成
    if (el.condition) {
        tests.push(generateConditionTest(el, mockName, path));
    }

    // data-testid があれば存在確認
    if (el.attr.testId) {
        tests.push(generateTestIdPresenceTest(el));
    }

    // イベントテスト（handlerCalls を使う）
    for (const event of el.attr.events) {
        const eventTest = generateEventTest(el, event, mockName, path);
        if (eventTest) tests.push(eventTest);
    }

    // select → option の検証
    if (el.tag === "select") {
        tests.push(generateSelectOptionsTest(mockName, path));
    }

    // 子要素を再帰的に処理
    const targetIndex: number = index === undefined ? 0 : index + 1;
    const currentPath = path;
    el.children.forEach((child) => {
        const childPath = `${currentPath}, ${targetIndex}`;
        tests.push(generateTestsForElement(child, mockName, childPath));
    });

    return tests.filter(Boolean).join("\n\n");
}

function generateConditionTest(
    el: UIElementInfo,
    mockName: string,
    path: string
) {
    const cond = el.condition;

    if (cond === "!editing") {
        return `
it("should show ${el.tag} when not editing", async () => {
    const el = await getChildElement(${path});
    expectElement({
        target: el,
        tagName: "${el.tag.toUpperCase()}",
    });
});`.trim();
    }

    if (cond === "editing") {
        return `
it("should show ${el.tag} after entering edit mode", async () => {
    fireEvent.click(root); // editing = true
    const el = await getChildElement(${path});
    expectElement({
        target: el,
        tagName: "${el.tag.toUpperCase()}",
    });
});`.trim();
    }

    return "";
}

function generateEventTest(
    el: UIElementInfo,
    event: string,
    mockName: string,
    path: string
) {
    const handlerNames = el.attr.handlerCalls;
    if (!handlerNames || handlerNames.length === 0) return null;

    const eventName = event.replace(/^on/, "").toLowerCase();
    let prefix="";
    if (el.condition === "editing") {
        prefix = `fireEvent.click(root);\n`;
    }
    return handlerNames
        .map(
            (handler) => `
it("should call ${handler} on ${event} for ${el.tag}", async () => {
    ${prefix}
    const el = await getChildElement(${path});
    fireEvent.${eventName}(el);
    expect(${mockName}.${handler}).toHaveBeenCalled();
});`.trim()
        )
        .join("\n");
}

function generateSelectOptionsTest(mockName: string, path: string) {
    return `
it("should render options", async () => {
    fireEvent.click(root); // enter edit mode

    const select = await getChildElement(${path});

    for (let index = 0; index < ${mockName}.options.length; index++) {
        const child = await getChildElement(select, index);
        expectElement({
            target: child,
            tagName: "OPTION",
            textContent: ${mockName}.labelMap[${mockName}.options[index]],
        });
    }
});`.trim();
}

function generateTestIdPresenceTest(el: UIElementInfo) {
    return `
it("should render ${el.tag} with data-testid=\\"${el.attr.testId}\\"", () => {
    expect(screen.getByTestId("${el.attr.testId}")).toBeInTheDocument();
});`.trim();
}

function indent(code: string, level: number) {
    return code
        .split("\n")
        .map((line) => (line ? "    ".repeat(level) + line : line))
        .join("\n");
}
