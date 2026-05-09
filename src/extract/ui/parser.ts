import ts from "typescript";
import { UIElementInfo } from "../../types/ui";
import { extractElement } from "./extractElement";
import { extractSource } from "./extractSource";

const conditionStack: string[] = [];

const pushCondition = (cond: string) => {
    conditionStack.push(cond);
}

const popCondition = (): string | undefined => {
    return conditionStack.pop();
}

// JSXElement <div>...</div>
export const parseJsxElement = (node: ts.JsxElement): UIElementInfo => {
    const cond = popCondition();
    const info = {
        ...extractElement(node.openingElement),
        ...(cond ?
            { condition: cond } : {}),
    };

    node.children.forEach(child => {
        info.children.push(...extractSource(child));
    });

    return info;
}

// JSXSelfClosingElement <span />
export const parseJsxSelfClosingElement = (node: ts.JsxSelfClosingElement): UIElementInfo => {
    const cond = popCondition();
    return {
        ...extractElement(node),
        ...(cond ?
            { condition: cond } : {}),
    };
}

// JSXFragment <>...</>
export const parseJsxFragment = (node: ts.JsxFragment): UIElementInfo[] => {
    const children: UIElementInfo[] = [];

    for (const child of node.children) {
        const childInfo = extractSource(child);
        if (childInfo) children.push(...childInfo);
    }

    return children;
}

// JSXExpression { ... }
export const parseJsxExpression = (node: ts.JsxExpression): UIElementInfo[] => {
    const expr = node.expression;
    if (!expr) return [];

    // boolean 単体
    if (ts.isPrefixUnaryExpression(expr) || ts.isIdentifier(expr))
        return parsePrefixUnaryExpressionOrIdentifier(expr);

    // editing && <select>
    if (ts.isBinaryExpression(expr) &&
        expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken)
        return parseBinaryExpression(expr);

    // editing ? <A> : <B>
    if (ts.isConditionalExpression(expr))
        return parseConditionalExpression(expr);

    return [];
}

const parsePrefixUnaryExpressionOrIdentifier = (expr: ts.PrefixUnaryExpression | ts.Identifier) => {
    pushCondition(expr.getText());
    return [];
}

const parseBinaryExpression = (expr: ts.BinaryExpression) => {
    pushCondition(expr.left.getText());
    return extractSource(expr.right);
}

const parseConditionalExpression = (expr: ts.ConditionalExpression): UIElementInfo[] => {
    const cond = expr.condition.getText();
    const conditions = [
        { express: expr.whenTrue, condition: cond },
        { express: expr.whenFalse, condition: `!(${cond})` },
    ];
    const result: UIElementInfo[] = conditions.flatMap(v => {
        const nodes = extractSource(v.express);
        nodes.forEach(n => n.condition = v.condition);
        return nodes;
    });

    return result;
}