import path from "path";
import { extractMockInfo } from "../extract/mock/extractMockInfo";
import fileManager from "../helper/fileManager";
import type { FileAnalysis } from "../types/types";
import apiTemplate from "./template/apiTemplate";
import defaultTemplate from "./template/defaultTemplate";
import hookTemplate from "./template/hookTemplate";
import uiTestTemplate from "./template/uiTestTemplate";

// 相対パスのみモック対象
const isMockTarget = (modulePath: string): boolean => {
    if (!modulePath.startsWith(".")) return false;
    if (modulePath.endsWith(".css")) return false;
    if (modulePath.includes("types")) return false;
    if (modulePath.includes("db")) return false;
    return true;
};

// ファイル種別判定
const detectFileType = (
    analysis: FileAnalysis
): "hook" | "component" | "api" | "other" => {
    const file = analysis.meta.fileName.toLowerCase();
    const named = analysis.source.exports.named;

    if (named.some((n) => n.startsWith("use"))) return "hook";

    if (file.endsWith(".tsx") && named.some((n) => /^[A-Z]/.test(n))) {
        return "component";
    }

    if (named.some((n) => n.toLowerCase().includes("api"))) return "api";

    return "other";
};

// 相対パス計算（Windows → / 正規化）
const resolveImportPath = (testFilePath: string, targetAbsPath: string): string => {
    const testDir = path.dirname(testFilePath);
    const relative = path.relative(testDir, targetAbsPath);
    return "./" + relative.replace(/\\/g, "/");
};

// テストファイル生成
const generateTestFile = (analysis: FileAnalysis): void => {
    const name = analysis.source.exports.named[0];
    if (!name) return;

    // テスト対象ファイルの絶対パス
    const targetFile = path.resolve(analysis.meta.filePath);
    const targetDir = path.dirname(targetFile);

    const type = detectFileType(analysis);


    // __tests__/hooks ディレクトリ
    const testDir =
        type === "hook" ? path.resolve(targetDir, "../../__tests__/hooks") :
            type === "component" ? path.resolve(targetDir, "../__tests__/ui") : ""
        ;

    // テストファイルパス
    const testFile = path.resolve(
        testDir,
        type === "hook" ? path.basename(targetFile).replace(".ts", ".test.ts") :
            type === "component" ? path.basename(targetFile).replace(".tsx", ".test.tsx") : ""
    );

    const normalizedTarget = targetFile.replace(/\\/g, "/");
    const normalizedTest = testFile.replace(/\\/g, "/");

    // モック情報抽出
    const mockInfo = extractMockInfo(analysis.source.imports)
        .filter((m) => isMockTarget(m.importPath))
        .map((m) => ({
            ...m,
            importPath: resolveImportPath(
                normalizedTest,
                path.resolve(path.dirname(normalizedTarget), m.importPath)
            ),
        }));

    // テスト対象ファイルの import パス
    const hookImportPath = resolveImportPath(normalizedTest, normalizedTarget).replace(/\.ts$/, "");
    const uiImportPath = resolveImportPath(normalizedTest, normalizedTarget).replace(/\.tsx$/, "");

    const template = () => ({
        hook: hookTemplate({
            name,
            hookPath: hookImportPath,
            mocks: mockInfo,
        }),
        // component: componentTemplate({
        //     name,
        //     componentPath: hookImportPath,
        //     mocks: mockInfo,
        // }),
        component: uiTestTemplate({
            file: name,
            exports: analysis.source.exports,
            ui: analysis.ui.elements
        }) as string,
        // component:"",
        api: apiTemplate({
            name,
            hookPath: hookImportPath,
            apiName: name.replace("use", "").replace("Api", "Api").toLowerCase(),
            apiModulePath: mockInfo[0]?.importPath ?? "",
        }),
        other: defaultTemplate(name),
    });

    fileManager.create(normalizedTest, template()[type]);
};

export = generateTestFile;
