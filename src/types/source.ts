export type ImportInfo = {
    module: string;
    named: string[];
    default?: string;
};

export type ExportInfo = {
    named: string[];
    default?: string;
};

export type Calls = {
    type: "function" | "method" | "imported";
    name?: string;
    object?: string;
    method?: string;
    module?: string;
};

export type FunctionInfo = {
    name: string;
    params: string[];
    returnType?: string;
    isAsync: boolean;
    calls: Calls[];
    returnAst?: any;
    returnKeys?: string[];
};

type InitializerType =
    "object"
    | "array"
    | "literal"
    | "function"
    | "arrowFunction"
    | "callExpression"
    | "awaitExpression"
    | "unknown";

export type VariableInfo = {
    name: string;
    initializerType: InitializerType;
    valueAst?: any;
};

export type SourceStructure = {
    functions: FunctionInfo[];
    variables: VariableInfo[];
    exports: ExportInfo;
    imports: ImportInfo[];
};

