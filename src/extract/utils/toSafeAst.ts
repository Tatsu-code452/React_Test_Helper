import ts from "typescript";

export const toSafeAst = (node: ts.Node | undefined): any => {
    if (!node) return undefined;

    return {
        kind: ts.SyntaxKind[node.kind],
        text: node.getText(),
    };
};
