import { execSync } from "node:child_process";

const latestGitCommitHash = execSync('git rev-parse HEAD').toString().trim();

export default {
    hash: latestGitCommitHash,
}
