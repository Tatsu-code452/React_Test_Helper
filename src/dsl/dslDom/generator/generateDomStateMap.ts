import { sliceCols, toSplitCols } from "../../utils/utils";

export const generateDomStateMap = (mapLines: string[]): string => {
    const domStateMapImports = mapLines
        .map(v => {
            const cols = sliceCols(toSplitCols(v.replaceAll("\"", ""), ":"), 3);
            if (cols) return `import { ${cols[2]} } from "./assert/${cols[0]}";`
        })
        .join("\n");

    const domStateMap = `
${domStateMapImports}

export const domStateMap = {
${mapLines.join("\n")}
};
`.trim();

    return domStateMap;
}