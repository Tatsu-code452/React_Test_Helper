import ts from "typescript";
import { Calls, ImportInfo } from "../../types/source";

export const findCalls = (node: ts.Node): Calls[] => {
    const calls: Calls[] = [];

    const visit = (n: ts.Node) => {
        if (ts.isCallExpression(n)) {
            const expr = n.expression;

            // obj.method()
            if (ts.isPropertyAccessExpression(expr)) {
                calls.push({
                    type: "method",
                    object: expr.expression.getText(),
                    method: expr.name.getText(),
                });
            }

            // function()
            else if (ts.isIdentifier(expr)) {
                calls.push({
                    type: "function",
                    name: expr.text,
                });
            }
        }

        ts.forEachChild(n, visit);
    };

    visit(node);
    return calls;
};

export const classifyImportedCalls = (calls: Calls[], imports: ImportInfo[]): Calls[] => {
    const importedNames = new Map<string, string>(); // name → module

    for (const imp of imports) {
        for (const n of imp.named) {
            importedNames.set(n, imp.module);
        }
    }

    return calls.map(call => {
        if (call.type === "function" && call.name && importedNames.has(call.name)) {
            return {
                type: "imported",
                module: importedNames.get(call.name),
                name: call.name,
            } as Calls;
        }
        return call;
    });
};
