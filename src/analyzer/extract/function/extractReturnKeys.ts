export const extractReturnKeys = (returnAst: { text: string } | undefined): string[] => {
    if (!returnAst?.text) return [];

    const text = returnAst.text;

    // { a, b, c } の中身を抽出
    const match = text.match(/\{([\s\S]*?)\}/);
    if (!match) return [];

    const inside = match[1];
    if (!inside) return [];
    
    return inside
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => s.replace(/:.*/, "").trim()); // a: value → a
};
