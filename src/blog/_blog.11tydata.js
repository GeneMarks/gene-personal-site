import fs from "fs";

export default {
    layout: "layouts/post.html",
    tags: ["post"],
    eleventyComputed: {
        modified: (data) => {
            const postFileStats = fs.statSync(data.page.inputPath);
            return postFileStats.mtime;
        }
    }
};
