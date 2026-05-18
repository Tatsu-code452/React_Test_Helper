export const getLinesWithTrim = (text: string) => {
    return text.split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

export const isTitle = (line: string) => {
    return /^#{2,}\s/.test(line);
}

export const toGroupName = (line: string) => {
    return line.replace(/^#{2,}\s*/, "").trim();
}

export const isDslRow = (line: string) =>
    line.trim().startsWith("|") &&
    !line.startsWith("| State") &&
    !line.startsWith("| ---");

export const toSplitCols = (line: string, separator: string): string[] => {
    return line.split(separator)
        .map((c) => c.trim())
        .filter(Boolean)
}

export const sliceCols = (cols: string[], length: number) => {
    if (cols.length < length) return undefined;
    return cols.slice(0, length);
}

export const capitalize = (s: string) =>
    s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);

export const isTargetKey = <T extends string>(key: string | undefined, arr: readonly unknown[]): key is T => {
    return key !== undefined && (arr as readonly string[]).includes(key);
}
