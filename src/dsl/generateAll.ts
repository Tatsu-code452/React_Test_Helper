import { createFileWithDir } from "../helper/fileManager";
import { analyzeDomDsl } from "./dslDom/analyzer/analyze";
import { generateDomAssert } from "./dslDom/generator/generateDomAssert";
import { generateDomStateMap } from "./dslDom/generator/generateDomStateMap";
import { analyzeStateDsl } from "./dslState/analyzer/analyzeStateDsl";
import { convertStateMachineToScenario } from "./dslTest/convertStateMachineToScenario";
import { generateScenarioTest } from "./dslTest/generateScenarioTest";
import { DomState } from "./model";

export const generateAll = (domDslPath: string, stateDslPath: string) => {
    // 1. DOM DSL → DomState[]
    const domStates: DomState[] = analyzeDomDsl(domDslPath);

    // 2. DOM assertion 関数
    const { assertFiles, mapLines } = generateDomAssert(domStates);

    // 3. domStateMap 自動生成
    const domStateMap = generateDomStateMap(mapLines);

    // 4. 状態遷移 DSL → Record<string, StateMachine[]>
    const stateMachines = analyzeStateDsl(stateDslPath);

    // 5. StateMachine[] → ScenarioStep[] に変換
    const scenarios = convertStateMachineToScenario(stateMachines);

    // 6. Scenario → テストコード生成
    const tests: Record<string, string> = {};
    for (const name of Object.keys(scenarios)) {
        const scenario = scenarios[name];
        if (!scenario) continue;
        tests[name] = generateScenarioTest(scenario);
    }

    // 7. ファイル出力
    const base = "__output__/dsl";

    // assert ファイル群
    outputAssertFiles(base, assertFiles);

    // domStateMap
    createFileWithDir(
        `${base}`,
        "domStateMap.ts",
        domStateMap
    );

    // scenario test
    outputScenarioTestFiles(base, tests);

    console.log("DSL → テストコード自動生成 完了");
};

const sanitize = (name: string) =>
    name.replace(/[^\w\-]/g, "");

const outputAssertFiles = (baseDir: string, assertFiles: Record<string, string>) => {
    for (const group of Object.keys(assertFiles)) {
        if (!assertFiles[group]) continue;
        createFileWithDir(
            `${baseDir}/assert`,
            `${group}.ts`,
            assertFiles[group]
        );
    }
}

const outputScenarioTestFiles = (baseDir: string, tests: Record<string, string>) => {
    for (const name of Object.keys(tests)) {
        if (!tests[name]) continue;
        createFileWithDir(
            `${baseDir}/tests`,
            `${sanitize(name)}.test.ts`,
            tests[name]
        );
    }
}
