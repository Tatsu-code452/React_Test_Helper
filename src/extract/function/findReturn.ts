import ts from "typescript";

export const findReturn = (node: ts.Node): ts.Expression | undefined => {
    let result: ts.Expression | undefined;

    const visit = (n: ts.Node) => {
        if (ts.isReturnStatement(n) && n.expression) {
            result = n.expression;
        }
        ts.forEachChild(n, visit);
    };

    visit(node);
    return result;
};
