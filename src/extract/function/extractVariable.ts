import ts from "typescript";
import { VariableInfo } from "../../types/source";
import { toSafeAst } from "../utils/toSafeAst";

export const extractVariable = (decl: ts.VariableDeclaration): VariableInfo => {
    const name = decl.name.getText();
    const init = decl.initializer;

    if (!init) return { name, initializerType: "unknown" };

    if (ts.isArrowFunction(init)) {
        return { name, initializerType: "arrowFunction", valueAst: toSafeAst(init) };
    }

    if (ts.isCallExpression(init)) {
        return { name, initializerType: "callExpression", valueAst: toSafeAst(init) };
    }

    if (ts.isAwaitExpression(init)) {
        return { name, initializerType: "awaitExpression", valueAst: toSafeAst(init) };
    }

    if (ts.isObjectLiteralExpression(init)) {
        return { name, initializerType: "object", valueAst: toSafeAst(init) };
    }

    if (ts.isArrayLiteralExpression(init)) {
        return { name, initializerType: "array", valueAst: toSafeAst(init) };
    }

    if (ts.isLiteralExpression(init)) {
        return { name, initializerType: "literal", valueAst: toSafeAst(init) };
    }

    return { name, initializerType: "unknown", valueAst: toSafeAst(init) };
};
