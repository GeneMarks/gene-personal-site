export default async function(config) {
    config.amendLibrary("md", (library) => {
        library.renderer.rules.table_open = function () {
            return '<div class="table-wrapper"><table class="table table-striped">';
        };

        library.renderer.rules.table_close = function () {
            return '</table></div>';
        };
    });
}
