import * as path from "node:path";
import * as fs from "node:fs";

const ORIGINAL_BASE_PATH = "./src/gen";
const ENHANCER_BASE_PATH = "./src/enhancer";

const ENHANCER_COMMENT_WARNING = "  // ⚠️ Added by enhancer script ⚠️"

function main() {
    fs.readdir(ENHANCER_BASE_PATH,  {recursive: true}, (err, files) => {
        if (err) {
            console.error("Cannot read file", err)
            return
        }

        for (const file of files) {
            const enhancedFilePath = path.join(ENHANCER_BASE_PATH, file.toString());
            const originalFilePath = path.join(ORIGINAL_BASE_PATH, file.toString());
            const filename = path.basename(file.toString());

            // skip directories
            if (!fs.lstatSync(enhancedFilePath).isFile()) {
                continue;
            }

            enhanceFile(enhancedFilePath, originalFilePath, filename);
        }
    })
}

function enhanceFile(enhancedFilePath: string, originalFilePath: string, filename: string) {
    const originalFile: string = fs.readFileSync(originalFilePath, { encoding: 'utf8' });
    let originalFileLines: string[] = originalFile.split("\n");
    const enhancerFile: string = fs.readFileSync(enhancedFilePath, { encoding: 'utf8' });
    let enhancerFileLines: string[] = enhancerFile.split("\n");

    /*
    ** handle imports
     */
    enhancerFileLines.forEach((line) => {
        if (line.startsWith("import ")) {
            // do not import the original classes
            if (line.includes(filename.replace(".ts", ""))) {
                return ;
            }
            originalFileLines.splice(0, 0, line);
        }
    })

    /*
    ** handle extended classes
     */
    // extract extended classes corpus
    let enhancedClasses: { [id: string] : string[] } = {};
    let className: string = undefined;
    for (const line of enhancerFileLines) {
        if (line.includes("class") && line.includes("extends")) {
            // extract extended class name
            className = line.slice(line.indexOf("extends ") + "extends ".length).trim().slice(0, -1).trim();
            enhancedClasses[className] = [];
        }
        else if (line == "}" && className) {
            className = undefined;
        }
        else if (className) {
            enhancedClasses[className].push(line);
        }
    }

    // integrate extended classes in original
    for (let className in enhancedClasses) {
        let classStartIndex = originalFileLines.findIndex((l) => l.startsWith("export class " + className + " "));
        let classEndIndex = classStartIndex + originalFileLines.slice(classStartIndex).indexOf("}");

        // fix tabulations
        enhancedClasses[className] = enhancedClasses[className].map(line => line.replace("\n", "    ").replace("    ", "  "))

        // add warnings messages before function and attributes declaration
        enhancedClasses[className] = enhancedClasses[className].map(line => line.match("(public|private|protected)") ? ENHANCER_COMMENT_WARNING + "\n" + line : line);

        originalFileLines.splice(classEndIndex, 0, "", ...enhancedClasses[className]);
    }

    // re-write original file
    fs.writeFileSync(originalFilePath, originalFileLines.join("\n"));
}

main()
