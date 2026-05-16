import ts from "typescript";
import { UIElementInfo } from "../../types/ui";
import { parseJsxElement, parseJsxExpression, parseJsxFragment, parseJsxSelfClosingElement } from "./parser";

export const extractSource = (node: ts.Node): UIElementInfo[] => {
    if (ts.isJsxElement(node)) return [parseJsxElement(node)];
    if (ts.isJsxSelfClosingElement(node)) return [parseJsxSelfClosingElement(node)];
    if (ts.isJsxFragment(node)) return parseJsxFragment(node);
    if (ts.isJsxExpression(node) && node.expression) return parseJsxExpression(node);

    // その他のノード → 子を探索
    const collected: UIElementInfo[] = [];
    node.forEachChild((child) => collected.push(...extractSource(child)));

    if (collected.length === 0) return [];
    return collected;
};