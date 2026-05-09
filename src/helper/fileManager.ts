import fs from "fs";

const read = (filePath: string) => {
    return fs.readFileSync(filePath, "utf8");
}

const create = (fileName: string, source: string) => {
    const filePath = `.\\__tests__`;
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
    const testFileName = fileName.split("/").pop();
    fs.writeFileSync(`${filePath}\\${testFileName}`, source, "utf8");
}

const createFileWithDir = (filePath: string, fileName: string, target: string) => {
    const path = `.\\${filePath}`;
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    fs.writeFileSync(`${path}\\${fileName}`, target, "utf8");
}

const createFile = (fileName: string, target: string) => {
    fs.writeFileSync(`.\\${fileName}`, target, "utf8");
}

export = { read, create, createFile, createFileWithDir }