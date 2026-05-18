import { Scenario, ScenarioStep, StateMachine } from "../model";

export const convertStateMachineToScenario = (
    tables: Record<string, StateMachine[]>
): Record<string, Scenario> => {
    const scenarios: Record<string, Scenario> = {};

    for (const name of Object.keys(tables)) {
        const rows = tables[name];
        if (!rows) continue;

        const steps: ScenarioStep[] = rows.map((r) => ({
            event: `${r.event.target}:${r.event.name}`,
            expect: `${r.expect?.domain}:${r.expect?.state}`,
        }));

        scenarios[name] = { name, steps };
    }

    return scenarios;
};
