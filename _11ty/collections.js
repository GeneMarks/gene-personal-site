export default async function(config) {

    config.addCollection("postsByCreated", (collectionApi) =>
        collectionApi.getFilteredByTag("post")
                     .sort((a, b) => b.data.created - a.data.created));

    config.addCollection("tagList", (collectionApi) => {
        const filter = ["post"];
        const tagSet = new Set();

        collectionApi.getAll().forEach((item) => {
            (item.data.tags || []).forEach((tag) => {
                if (!filter.includes(tag)) {
                    tagSet.add(tag);
                }
            });
        });

        return [...tagSet].sort();
    });

}
