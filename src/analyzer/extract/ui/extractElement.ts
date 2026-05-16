import ts from "typescript";
import { UIElementInfo } from "../../types/ui";

const IGNORED_CALLS = new Set([
    "stopPropagation",
    "preventDefault",
]);

export const extractElement = (node: ts.JsxOpeningLikeElement): UIElementInfo => {
    const result: UIElementInfo = {
        tag: node.tagName.getText(),
        attr: {
            dataAttrs: {},
            events: [],
            props: {},
            handlerCalls: [],
        },
        children: [],
    };

    for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr)) continue;

        const name = attr.name.getText();
        const value = extractAttributeValue(attr);

        if (name === "data-testid") result.attr.testId = value;
        if (name === "id") result.attr.id = value;
        if (name.startsWith("data-")) result.attr.dataAttrs[name] = value;
        if (name.startsWith("on")) {
            result.attr.events.push(name);
            result.attr.handlerCalls!.push(...extractHandlerCalls(value));
            result.attr.handlerCalls = Array.from(new Set(result.attr.handlerCalls));
        }
        result.attr.props[name] = value;
    }

    return result;
}

const extractAttributeValue = (attr: ts.JsxAttribute): string => {
    if (!attr.initializer) return "";

    if (ts.isStringLiteral(attr.initializer)) {
        return attr.initializer.text;
    } else if (ts.isJsxExpression(attr.initializer)) {
        return attr.initializer.expression?.getText() ?? "";
    }

    return "";
}

const extractHandlerCalls = (code: string): string[] => {
    const calls: string[] = [];

    const source = ts.createSourceFile(
        "handler.ts",
        `(${code})`,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );

    const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
            const expr = node.expression;

            if (ts.isIdentifier(expr)) {
                const name = expr.text;
                if (!IGNORED_CALLS.has(name)) {
                    calls.push(name);
                }
            }

            if (ts.isPropertyAccessExpression(expr)) {
                const name = expr.name.getText();
                if (!IGNORED_CALLS.has(name)) {
                    calls.push(name);
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    ts.forEachChild(source, visit);

    // 重複排除
    return Array.from(new Set(calls));
};
