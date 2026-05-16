import ts from "typescript";
import { Calls, ImportInfo } from "../../types/source";

export const ignoreFunctions = new Set([
    "useMemo",
    "useCallback",
    "useEffect",
    "alert",
]);

export const findCalls = (node: ts.Node): Calls[] => {
    const calls: Calls[] = [];
    const callsNames = new Set();

    const visit = (n: ts.Node) => {
        if (ts.isCallExpression(n)) {
            const expr = n.expression;

            // obj.method()
            if (ts.isPropertyAccessExpression(expr)) {
                const name = `${expr.expression.getText()}.${expr.name.getText()}`;
                if (!callsNames.has(name)) {
                    callsNames.add(name);
                    calls.push({ type: "method", name });
                }
            }

            // function()
            else if (ts.isIdentifier(expr)) {
                const name = expr.text;
                if (!ignoreFunctions.has(name) && !callsNames.has(name)) {
                    callsNames.add(name);
                    calls.push({ type: "function", name });
                }
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
