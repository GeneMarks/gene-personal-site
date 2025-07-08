export default {
    layout: "layouts/post.html",
    tags: ["post"],
    eleventyComputed: {
        date: data => {
            const match = data.page.fileSlug.match(/^(\d{4}-\d{2}-\d{2})/);
            return match ? new Date(match[1]) : new Date();
        },
    },
};
