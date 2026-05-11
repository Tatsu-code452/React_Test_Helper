import fileManager from "../helper/fileManager";
import { Calls } from "../types/source";
import { FileAnalysis } from "../types/types";

export type FunctionEdge = {
    fromId: string; // 関数名
    fromName: string;
    fromLayer: string;
    toId: string;   // 関数名
    toName: string;
    toLayer: string;
    kind: "function" | "method" | "imported";
};

export const toMermaid = (edges: Map<string, FunctionEdge>) => {

    const groupsMap = Array.from(edges.values())
        .reduce((map, edge) => {
            map.has(edge.fromLayer) ?
                map.get(edge.fromLayer)?.push(edge.fromId) :
                map.set(edge.fromLayer, [edge.fromId]);
            map.has(edge.toLayer) ?
                map.get(edge.toLayer)?.push(edge.toId) :
                map.set(edge.toLayer, [edge.toId]);
            return map;
        }, new Map<string, string[]>());

    const groups: Record<string, Set<string>> =
        Object.fromEntries(Array.from(groupsMap.entries()).
            map(([key, value]) => [key, new Set(value)]));

    const lines: string[] = [];
    lines.push("```mermaid");
    lines.push("flowchart TD");


    for (const layer of Object.keys(groups)) {
        if (!groups[layer]) continue;

        lines.push(`  subgraph ${layer}`);
        for (const id of groups[layer]) {
            const node = Array.from(edges.values()).find(e => e.fromId === id || e.toId === id);
            if (node) {
                const label = node.fromId === id ? node.fromName : node.toName;
                lines.push(`    ${id}["${label}"]`);
            }
        }
        lines.push("  end");
    }

    for (const edge of edges.values()) {
        const label =
            edge.kind === "function"
                ? "call"
                : edge.kind === "method"
                    ? "method"
                    : "import";


        lines.push(`  ${edge.fromId}["${edge.fromName}"] -->|${label}| ${edge.toId}["${edge.toName}"]`);
    }
    lines.push("```");


    return lines.join("\n");
};

// ノイズ除外対象
const ignoreMethodPrefix = [
    ".toString",
    ".trim",
    ".push",
    ".join",
    ".forEach",
    ".keys",
    "e.",
    "Object.",
];

export const buildFunctionGraph = (files: FileAnalysis[]) => {
    let result: string = "";
    const edges = new Map<string, FunctionEdge>();

    const functionToLayer = createFunctionLayerMap(files);

    for (const file of files) {
        for (const fn of file.source.functions) {
            for (const call of fn.calls) {
                const toName = getToName(call);
                if (!toName) continue;

                const fileName = file.meta.fileName;
                const fromId = normalize(`${fileName}_${fn.name}`);
                const toId = normalize(`${fileName}_${toName}`);

                edges.set(`${fromId}->${toId}`, {
                    fromId,
                    fromName: `${fileName}: ${fn.name}`,
                    fromLayer: functionToLayer.get(fromId) || "Other",
                    toId,
                    toName: `${fileName}: ${toName}`,
                    toLayer: functionToLayer.get(toId) || "Other",
                    kind: call.type,
                } as FunctionEdge);
            }
        }
    }

    result = toMermaid(edges)
    fileManager.createFileWithDir("__output__\\__graph__", `function_dependency_graph.md`, result);

};

const normalize = (name: string) =>
    name
        .replace(/[^a-zA-Z0-9_]/g, "_") // 記号を全部 _
        .replace(/_+/g, "_")            // 連続した _ を1つに
        .replace(/^_+|_+$/g, "");       // 先頭と末尾の _ を除去

const classifyFile = (fileName: string) => {
    if (fileName.endsWith(".tsx")) return "UI";
    if (fileName.includes("Controller")) return "Controller";
    if (fileName.includes("Handler")) return "Handler";
    if (fileName.includes("Api")) return "API";
    if (fileName.includes("States")) return "States";
    return "Other";
};

const createFunctionLayerMap = (files: FileAnalysis[]): Map<string, string> => {
    return files.reduce((map, file) => {
        file.source.functions.forEach(fn => {
            const fileName = file.meta.fileName;
            const layer = classifyFile(fileName);
            map.set(
                normalize(`${fileName}_${fn.name}`),
                layer
            );
            fn.calls.forEach(call => {
                const toName = getToName(call);
                if (toName) map.set(
                    normalize(`${fileName}_${toName}`),
                    layer
                );

            });
        });
        return map;
    }, new Map<string, string>());
}

const getToName = (call: Calls): string | undefined => {
    if (call.type === "function") {
        return call.name;
    }

    if (call.type === "method") {
        const full = `${call.name}`;
        if (!ignoreMethodPrefix.some(p => full.includes(p))) return full;
    }

    if (call.type === "imported") return call.name;

    return undefined;
}