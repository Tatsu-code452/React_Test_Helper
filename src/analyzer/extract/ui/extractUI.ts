import ts from "typescript";
import { UIElementInfo } from "../../types/ui";
import { extractElement } from "./extractElement";

export const extractUI = (node: ts.Node): UIElementInfo | null => {

    // <Component />
    if (ts.isJsxSelfClosingElement(node)) {
        return {
            tag: node.tagName.getText(),
            attr: extractElement(node).attr,
            children: [],
        };
    }

    // <Component>...</Component>
    if (ts.isJsxElement(node)) {
        return {
            tag: node.openingElement.tagName.getText(),
            attr: extractElement(node.openingElement).attr,
            children: node.children
                .map((child) => extractUI(child))
                .filter((c): c is UIElementInfo => c !== null),
        };
    }

    if (ts.isJsxExpression(node)) {
        if (node.expression) {
            return extractUI(node.expression);
        }
    }

    // map(...) の中の JSXElement を拾う
    if (ts.isCallExpression(node)) {
        return extractUI(node.expression) ?? null;
    }

    return null;
};
