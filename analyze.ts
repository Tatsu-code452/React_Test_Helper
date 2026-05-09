import { analyzeFolder } from "./src/analyzer/analyzeFolder";
import { buildFunctionGraph } from "./src/graph/buildDependencyGraph";
import fileManager from "./src/helper/fileManager";

const printUsage = () => {
    console.log(`
Usage:
  npx ts-node analyze.ts <folder> [option]

Options:
  graph   Generate function dependency graph
  json    Output analysis result as JSON
  help    Show this help
`);
};

/** CLI 実行 */
if (require.main === module) {
    const target = process.argv[2];
    const option = process.argv[3];

    if (!target || option === "help") {
        printUsage();
        process.exit(0);
    }

    try {

        const result = analyzeFolder(target);

        switch (option) {
            case "json":
                result.forEach(v =>
                    fileManager.createFileWithDir("__output__\\analyze", `${v.meta.fileName}.json`, JSON.stringify(v, null, 2)))
                break;

            case "graph":
                buildFunctionGraph(result);
                break;

            case "all":
                result.forEach(v =>
                    fileManager.createFileWithDir("__output__\\analyze", `${v.meta.fileName}.json`, JSON.stringify(v, null, 2)))
                buildFunctionGraph(result);
                break;

            case undefined:
                console.log("analyze success");
                // 何もしない（解析だけ）
                break;

            default:
                console.error(`Unknown option: ${option}`);
                printUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(`analyze faild:`);
        console.error(error);
    }
}
