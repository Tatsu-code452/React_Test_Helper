import ts from "typescript";

import {
    ExportInfo, FunctionInfo, ImportInfo, SourceStructure,
    VariableInfo
} from "../types/source";
import {
    FileAnalysis
} from "../types/types";
import {
    UIAnalysis,
    UIElementInfo
} from "../types/ui";
import { extractExports } from "./export/extractExports";
import { extractArrowFunction } from "./function/extractArrowFunction";
import { extractFunction } from "./function/extractFunction";
import { extractVariable } from "./function/extractVariable";
import { classifyImportedCalls } from "./function/findCalls";
import { extractImport } from "./import/extractImports";
import { extractMeta } from "./meta/extractMeta";
import { extractUI } from "./ui/extractUI";

export const extract = (filePath: string, sourceCode: string): FileAnalysis => {
    const sourceFile = ts.createSourceFile(
        filePath,
        sourceCode,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );

    const meta = extractMeta(filePath);
    const imports: ImportInfo[] = [];
    const exports: ExportInfo = { named: [] };
    const functions: FunctionInfo[] = [];
    const variables: VariableInfo[] = [];
    const uiElements: UIElementInfo[] = [];

    const visit = (node: ts.Node) => {
        // import
        if (ts.isImportDeclaration(node)) {
            imports.push(extractImport(node));
        }

        // export
        const result = extractExports(node);
        if (result.default) exports.default = result.default;
        if (result.named.length > 0) exports.named.push(...result.named);

        // functions
        if (ts.isFunctionDeclaration(node) && node.name) {
            const work = extractFunction(node);
            work.calls = classifyImportedCalls(work.calls, imports);
            functions.push(work);
        }

        // const fn = () => {} 形式
        if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach((decl) => {
                if (ts.isIdentifier(decl.name)) {
                    const varName = decl.name.text;

                    // ArrowFunction → 関数として扱う
                    if (decl.initializer && ts.isArrowFunction(decl.initializer)) {
                        functions.push(extractArrowFunction(varName, decl.initializer));
                        return; // ★ 変数としては扱わない
                    }

                    // それ以外は変数として扱う
                    variables.push(extractVariable(decl));
                }
            });
        }

        // JSX → UI 解析（ルート JSXElement のみ）
        if (
            (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) &&
            !ts.isJsxElement(node.parent) &&
            !ts.isJsxSelfClosingElement(node.parent)
        ) {
            const ui = extractUI(node);
            if (ui) uiElements.push(ui);
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    const source: SourceStructure = {
        imports,
        exports,
        functions,
        variables,
    };

    const ui: UIAnalysis = {
        elements: uiElements,
    };

    return { meta, source, ui };
};
