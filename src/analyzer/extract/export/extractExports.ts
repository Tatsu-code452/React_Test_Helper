import ts from "typescript";
import type { ExportInfo } from "../../types/source";

export const extractExports = (node: ts.Node): ExportInfo => {
    const defaultName = extractDefaultExport(node);

    const named: string[] = [
        ...extractExportDeclaration(node),
        ...extractVariableStatement(node),
        ...extractFunctionDeclaration(node)
    ];

    return defaultName ? { named, default: defaultName } : { named };
};

const extractDefaultExport = (node: ts.Node): string | undefined =>
    ts.isExportAssignment(node) ?
        node.expression.getText() : undefined;

const extractExportDeclaration = (node: ts.Node): string[] => {
    if (isExportDeclaration(node)) {
        // export * from "./x"
        if (!node.exportClause && node.moduleSpecifier) {
            return [`*:${node.moduleSpecifier.getText().replace(/['"]/g, "")}`];
        }

        if (node.exportClause) {
            const clause = node.exportClause;

            // export { a, b, c }
            if (isNamedExports(clause)) {
                return extractNamedExports(clause);
            }

            // export * as foo from "./x"
            if (isNamespaceExport(clause)) {
                return [clause.name.text];
            }
        }

    }

    return [];
}

const isExportDeclaration = (
    node: ts.Node | undefined
): node is ts.ExportDeclaration => {
    return !!node && ts.isExportDeclaration(node);
};

const isNamedExports = (
    clause: ts.NamedExportBindings | undefined
): clause is ts.NamedExports =>
    !!clause && ts.isNamedExports(clause);

const isNamespaceExport = (
    clause: ts.NamedExportBindings | undefined
): clause is ts.NamespaceExport =>
    !!clause && ts.isNamespaceExport(clause);

const extractNamedExports = (clause: ts.NamedExports) =>
    clause.elements.map((e: ts.ExportSpecifier) => e.name.text);

const extractVariableStatement = (node: ts.Node): string[] => {
    if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        return node.declarationList.declarations
            .filter((decl) => ts.isIdentifier(decl.name))
            .map((decl) => (decl.name as ts.Identifier).text);
    }
    return [];
}

const extractFunctionDeclaration = (node: ts.Node): string[] => {
    if (ts.isFunctionDeclaration(node) &&
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) &&
        node.name) {
        return [node.name.text];
    }
    return [];
}