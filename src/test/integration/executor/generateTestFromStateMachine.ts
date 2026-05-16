export const generateTestFromStateMachine = (name: string, scenario: any) => {
    const indent = (n: number) => " ".repeat(n);

    const json = JSON.stringify(scenario, null, 2);

    return `
import { runScenario } from "../scenario/runScenario";
import { renderProjectListPage } from "../testUtils/renderPage";

describe("${name}", () => {
  it("scenario", async () => {
    renderProjectListPage();

    await runScenario(${json});
  });
});
`.trim();
};
