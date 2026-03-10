export default async function(config) {

    config.addShortcode("year", () => `${new Date().getFullYear()}`);

}
