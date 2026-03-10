import { execSync } from "node:child_process";

export default async function(config, buildDir) {

    config.on("eleventy.after", () => {
        execSync(`npx -y pagefind --site ${buildDir} --glob \"**/*.html\"`, { encoding: "utf-8" })
    });

}
