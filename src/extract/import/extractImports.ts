import ts from "typescript";
import { ImportInfo } from "../../types/source";

export const extractImport = (node: ts.ImportDeclaration): ImportInfo => {
    const module = (node.moduleSpecifier as ts.StringLiteral).text;
    const clause = node.importClause;

    const defaultName = extractDefaultImport(clause);
    const named = [
        ...extractNamedImports(clause?.namedBindings),
        ...extractNamespaceImport(clause?.namedBindings),
    ];

    return { module, named, default: defaultName };
};

const isNamedImports = (
    bindings: ts.NamedImportBindings | undefined
): bindings is ts.NamedImports => {
    return !!bindings && ts.isNamedImports(bindings);
}

const isNamespaceImport = (
    bindings: ts.NamedImportBindings | undefined
): bindings is ts.NamespaceImport => {
    return !!bindings && ts.isNamespaceImport(bindings);
};

const extractDefaultImport = (clause: ts.ImportClause | undefined): string =>
    clause?.name?.text ?? "";

const extractNamedImports = (bindings: ts.NamedImportBindings | undefined): string[] =>
    isNamedImports(bindings)
        ? bindings.elements.map(e => e.name.text)
        : [];

const extractNamespaceImport = (bindings: ts.NamedImportBindings | undefined): string[] =>
    isNamespaceImport(bindings)
        ? [`* as ${bindings.name.text}`]
        : [];
