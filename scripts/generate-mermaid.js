import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const mermaidsInputPath = "./src/_mermaid";
const mermaidsOutputPath = "./src/uploads/mermaid";

if (!fs.existsSync(mermaidsOutputPath)) {
    fs.mkdirSync(mermaidsOutputPath);
}

const mermaids = fs.readdirSync(mermaidsInputPath);
mermaids.forEach((file, _) => {
    const inputPath = path.join(mermaidsInputPath, file);
    const inputExtension = path.extname(file);
    const inputName = path.basename(file, inputExtension);

    const outputPath = path.join(mermaidsOutputPath, `${inputName}.svg`);

    execSync(`npx -p @mermaid-js/mermaid-cli mmdc -i "${inputPath}" -o "${outputPath}" -c "mermaid-config.json" -b transparent`, { stdio: "inherit" });
});
