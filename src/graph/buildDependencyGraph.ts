import fileManager from "../helper/fileManager";
import { FileAnalysis } from "../types/types";

export type FunctionNode = {
    file: string;
    name: string;
};

export type FunctionEdge = {
    from: string; // 関数名
    to: string;   // 関数名
    kind: "function" | "method" | "imported";
};

export const toMermaid = (graph: { nodes: FunctionNode[]; edges: FunctionEdge[] }) => {
    const lines: string[] = [];
    lines.push("```mermaid");
    lines.push("flowchart TD");

    for (const edge of graph.edges) {
        const label =
            edge.kind === "function"
                ? "call"
                : edge.kind === "method"
                    ? "method"
                    : "import";

        const fromId = normalize(edge.from);
        const toId = normalize(edge.to);

        lines.push(`  ${fromId}["${edge.from}"] -->|${label}| ${toId}["${edge.to}"]`);
    }
    lines.push("```");

    // fileManager.createFileWithDir("__output__\\__graph__", `${fileName}.md`, lines.join("\n"));

    return lines.join("\n");
};


export const buildFunctionGraph = (files: FileAnalysis[]) => {
    let result: string = "";
    const nodes: FunctionNode[] = [];
    const edges: FunctionEdge[] = [];
    for (const file of files) {
        for (const fn of file.source.functions) {
            nodes.push({ file: file.meta.fileName, name: fn.name });

            for (const call of fn.calls) {
                if (call.type === "function") {
                    edges.push({
                        from: fn.name,
                        to: call.name as string,
                        kind: "function",
                    });
                }

                if (call.type === "method") {
                    edges.push({
                        from: fn.name,
                        to: `${call.object}.${call.method}`,
                        kind: "method",
                    });
                }

                if (call.type === "imported") {
                    edges.push({
                        from: fn.name,
                        to: call.name as string,
                        kind: "imported",
                    });
                }
            }
        }
    }
    result = toMermaid({ nodes, edges })
    fileManager.createFileWithDir("__output__\\__graph__", `function_dependency_graph.md`, result);

};

const normalize = (name: string) =>
    name
        .replace(/[^a-zA-Z0-9_]/g, "_") // 記号を全部 _
        .replace(/_+/g, "_")            // 連続した _ を1つに
        .replace(/^_+|_+$/g, "");       // 先頭と末尾の _ を除去
