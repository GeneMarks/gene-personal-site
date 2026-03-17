import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

export default async function(config) {

    config.on("eleventy.after", ({ directories }) => {
        execSync(`npx -y pagefind --site "${directories.output}" --glob \"**/*.html\"`, { encoding: "utf-8" });
    });

    config.on("eleventy.after", ( { directories } ) => {
        const mermaidsInputPath = `${directories.input}/_mermaid`;
        const mermaidsOutputPath = `${directories.output}/uploads/mermaid`;

        if (!fs.existsSync(mermaidsOutputPath)) {
            fs.mkdirSync(mermaidsOutputPath);
        }

        const mermaids = fs.readdirSync(mermaidsInputPath);
        mermaids.forEach((file, _) => {
            const inputPath = path.join(mermaidsInputPath, file);
            const inputExtension = path.extname(file);
            const inputName = path.basename(file, inputExtension);

            const outputPath = path.join(mermaidsOutputPath, `${inputName}.svg`);

            execSync(`npx -p @mermaid-js/mermaid-cli mmdc -i "${inputPath}" -o "${outputPath}"`);
        });
    });
}
