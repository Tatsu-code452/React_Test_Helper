import { assertDomState } from "./assertDomState";
import { parseEvent } from "./parser/parseEvent";

export type Scenario = {
    initial?: string[];
    steps: {
        event: string;
        expect?: string[];
    }[];
    final?: string[];
};

export const runScenario = async (scenario: Scenario) => {
    // 1. 初期状態の検証
    if (scenario.initial) {
        for (const state of scenario.initial) {
            await assertDomState(state);
        }
    }

    // 2. ステップ実行
    for (const step of scenario.steps) {
        const event = parseEvent(step.event);
        if (!event) continue;
        await executeEvent(event);

        if (step.expect) {
            for (const state of step.expect) {
                await assertDomState(state);
            }
        }
    }

    // 3. 最終状態の検証
    if (scenario.final) {
        for (const state of scenario.final) {
            await assertDomState(state);
        }
    }
};

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const executeEvent = async (event: { domain: string; action: string }) => {
    const { domain, action } = event;

    if (domain === "search") {
        if (action === "Input") {
            await userEvent.type(screen.getByLabelText("案件名"), "A");
            await userEvent.type(screen.getByLabelText("顧客名"), "B");
            await userEvent.selectOptions(screen.getByLabelText("ステータス"), "InProgress");
        }
    }

    if (domain === "pagination") {
        if (action === "Next") {
            await userEvent.click(screen.getByRole("button", { name: "》" }));
        }
        if (action === "Prev") {
            await userEvent.click(screen.getByRole("button", { name: "《" }));
        }
    }

    if (domain === "modal") {
        if (action === "OpenCreate") {
            await userEvent.click(screen.getByRole("button", { name: "新規作成" }));
        }
        if (action === "OpenUpdate") {
            await userEvent.click(screen.getByRole("button", { name: "編集" }));
        }
    }
};
