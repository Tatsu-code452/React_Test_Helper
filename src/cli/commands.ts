import { analyzeFolder } from "../analyzer/analyzeFolder";
import { generateAll } from "../dsl/generateAll";
import { buildFunctionGraph } from "../graph/buildDependencyGraph";
import { createFileWithDir, read } from "../helper/fileManager";
import { generateTestFromStateMachine, StateMachine } from "../test/integration/generateTestFromStateMachine";

export const runJsonOutput = (target: string) => {
    const result = analyzeFolder(target);
    result.forEach(v =>
        createFileWithDir(
            "__output__/analyze",
            `${v.meta.fileName}.json`,
            JSON.stringify(v, null, 2)
        )
    );
};

export const runGraph = (target: string) => {
    const result = analyzeFolder(target);
    buildFunctionGraph(result);
};

export const runGenerateIntegrationTest = () => {
    const file: StateMachine = JSON.parse(
        read("./__input__/state_machine_table.json")
    );
    generateTestFromStateMachine(file);
};

export const runGenerateDslTest = (domPath: string, statePath: string) => {
    if (!domPath || !statePath) {
        console.error("Usage: npx tsx analyze.ts generateDslTest <domDslPath> <stateDslPath>");
        process.exit(1);
    }

    generateAll(domPath, statePath);
};

export const runAll = (target: string) => {
    const result = analyzeFolder(target);

    result.forEach(v =>
        createFileWithDir(
            "__output__/analyze",
            `${v.meta.fileName}.json`,
            JSON.stringify(v, null, 2)
        )
    );

    buildFunctionGraph(result);
};

export const commands: Record<string, Function> = {
    json: runJsonOutput,
    graph: runGraph,
    generateIntegrationTest: runGenerateIntegrationTest,
    generateDslTest: runGenerateDslTest,
    all: runAll,
};
