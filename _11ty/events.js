import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import * as path from "node:path";

export default async function(config) {

    config.on("eleventy.after", ({ directories }) => {
        execSync(`npx -y pagefind --site "${directories.output}" --glob \"**/*.html\"`, { encoding: "utf-8" });
    });

    config.on("eleventy.after", ( { directories } ) => {
        const mermaidsPath = `${directories.input}/_mermaid`;
        const mermaids = readdirSync(mermaidsPath);

        mermaids.forEach((file, _) => {
            const inputPath = path.join(mermaidsPath, file);
            const inputExtension = path.extname(file);
            const inputName = path.basename(file, inputExtension);

            const outputPath = path.join(directories.output, "/uploads/mermaid", `${inputName}.svg`);

            execSync(`npx -p @mermaid-js/mermaid-cli mmdc -i "${inputPath}" -o "${outputPath}"`);
        });
    });
}
