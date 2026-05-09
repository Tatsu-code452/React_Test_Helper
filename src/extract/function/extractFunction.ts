import ts from "typescript";
import { FunctionInfo } from "../../types/source";
import { toSafeAst } from "../utils/toSafeAst";
import { extractReturnKeys } from "./extractReturnKeys";
import { findCalls } from "./findCalls";
import { findReturn } from "./findReturn";

export const extractFunction = (node: ts.FunctionDeclaration): FunctionInfo => {
    const name = node.name?.text ?? "anonymous";
    const params = node.parameters.map((p) => p.name.getText());
    const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false;

    const calls = findCalls(node);
    const returnAst = toSafeAst(findReturn(node));
    return { name, params, isAsync, calls, returnAst, returnKeys: extractReturnKeys(returnAst) };
};
