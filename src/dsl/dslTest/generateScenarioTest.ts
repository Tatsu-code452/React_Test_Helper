import { Scenario } from "../model";

export const generateScenarioTest = (scenario: Scenario): string => {
  const stepsJson = JSON.stringify(scenario.steps, null, 2);
  const finalExpect = scenario.steps.at(-1)?.expect ?? "";

  return `
import { initialize, mockApiData } from "../../initializeApiMock";
initialize();
mockApiData();

import { renderPage } from "../executor/renderPage";
import { waitFor } from "@testing-library/react";
import { describe, it } from 'vitest';
import { runScenario } from "../executor/runScenario";
import { assertDomState } from "../executor/assertDomState";

describe("${scenario.name}", () => {
  it("scenario", async () => {
    await waitFor(()=>renderPage());

    await runScenario(${stepsJson});

    assertDomState("${finalExpect}");
  });
});
`.trim();
};
