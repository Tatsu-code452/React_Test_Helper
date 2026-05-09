import ts from "typescript";
import { FunctionInfo } from "../../types/source";
import { toSafeAst } from "../utils/toSafeAst";
import { extractReturnKeys } from "./extractReturnKeys";
import { findCalls } from "./findCalls";
import { findReturn } from "./findReturn";

export const extractArrowFunction = (name: string, node: ts.ArrowFunction): FunctionInfo => {
    const params = node.parameters.map((p) => p.name.getText());
    const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false;

    const calls = findCalls(node);
    const returnAst = toSafeAst(findReturn(node));

    return { name, params, isAsync, calls, returnAst, returnKeys: extractReturnKeys(returnAst) };
};
