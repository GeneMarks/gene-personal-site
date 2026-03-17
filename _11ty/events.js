import { execSync } from "node:child_process";

export default async function(config) {

    config.on("eleventy.after", ({ directories }) => {
        execSync(`npx -y pagefind --site "${directories.output}" --glob \"**/*.html\"`, { encoding: "utf-8" });
    });

}
