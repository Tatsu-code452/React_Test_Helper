import { createFileWithDir } from "../helper/fileManager";
import { analyzeDomDsl } from "./dslDom/analyzer/analyze";
import { generateDomAssertAndMap } from "./dslDom/generator/generateDomAssertAndMap";
import { analyzeStateDsl } from "./dslState/analyzer/analyzeStateDsl";
import { generateScenarioTest } from "./executor/generator/generateScenarioTest";

export const generateAll = (domDslPath: string, stateDslPath: string) => {
    // 1. DOM DSL → ParsedDomExpect
    const domParsed = analyzeDomDsl(domDslPath);

    // 2. assert 関数 + domStateMap 自動生成
    const { assertFiles, domStateMap } = generateDomAssertAndMap(domParsed);

    // 3. 状態遷移 DSL → DslRow[]
    const stateTables = analyzeStateDsl(stateDslPath);

    // 4. グループごとに StateMachine → テストコード生成
    const tests: Record<string, string> = {};

    for (const group of Object.keys(stateTables)) {
        const rows = stateTables[group];
        if (!rows) continue;
        const testCode = generateScenarioTest(group, rows);
        tests[group] = testCode;
    }

    // 5. ファイル出力
    const base = "__output__/dsl";

    // assert ファイル群
    for (const group of Object.keys(assertFiles)) {
        if (!assertFiles[group]) continue;
        createFileWithDir(
            `${base}/assert`,
            `${group}.ts`,
            assertFiles[group]
        );
    }

    // domStateMap
    createFileWithDir(
        `${base}`,
        "domStateMap.ts",
        domStateMap
    );

    // scenario test
    for (const group of Object.keys(tests)) {
        if (!tests[group]) continue;
        createFileWithDir(
            `${base}/tests`,
            `${sanitize(group)}.test.ts`,
            tests[group]
        );
    }

    console.log("DSL → テストコード自動生成 完了");
};

const sanitize = (name: string) =>
    name.replace(/[^\w\-]/g, "");
