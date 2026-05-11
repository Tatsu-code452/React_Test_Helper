import ts from "typescript";
import { DeclarationGroup, FunctionInfo } from "../../types/source";
import { toSafeAst } from "../utils/toSafeAst";
import { extractReturnKeys } from "./extractReturnKeys";
import { findCalls } from "./findCalls";
import { findReturn } from "./findReturn";

export const extractArrowFunction = (
    name: string, node: ts.ArrowFunction
): FunctionInfo => buildFunctionInfo(name, node, toSafeAst(findReturn(node)));

const buildFunctionInfo = (name: string, node: ts.ArrowFunction, returnAst: any) => {
    return Object.fromEntries(
        Object.entries({
            name,
            params: node.parameters.map((p) => p.name.getText()),
            isAsync: node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false,
            calls: findCalls(node),
            declarationGroups: extractAllDeclarationGroups(node),
            returnAst,
            returnKeys: extractReturnKeys(returnAst)
        }).filter(([_, value]) => value !== undefined)) as FunctionInfo;
}

const extractAllDeclarationGroups = (node: ts.ArrowFunction): DeclarationGroup[] | undefined => {
    if (!ts.isBlock(node.body)) return undefined;
    const result = node.body.statements.reduce((groups, v) => {
        if (ts.isVariableStatement(v)) groups.push(...extractDeclarationGroups(v))
        return groups;
    }, [] as DeclarationGroup[]);

    return result.length > 0 ? result : undefined;
}

const extractDeclarationGroups = (node: ts.VariableStatement): DeclarationGroup[] => {
    return node.declarationList
        .declarations
        .filter(v =>
            ts.isVariableDeclaration(v) &&
            ts.isObjectBindingPattern(v.name))
        .map(extractDeclarationGroup)
}

const extractDeclarationGroup = (node: ts.VariableDeclaration): DeclarationGroup => {
    return {
        group: node.initializer?.getText().replace(/\(|\)/g, "") || "",
        properties: (node.name as ts.ObjectBindingPattern).elements
            .filter(ts.isBindingElement)
            .map(v => v.getText()),
    }
}
