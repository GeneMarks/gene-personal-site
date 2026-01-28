const margins = {
    "1.gif": -5,
    "2.gif": -5,
    "3.gif": -2,
    "4.gif": -4,
    "5.gif": -2,
    "6.gif": -6,
    "7.gif": -2,
    "8.gif": -4,
    "9.gif": -4,
};

const index = Math.floor(Math.random() * 9 + 1);
const filename = `${index}.gif`;
const path = `/assets/images/gene_sprites/${filename}`;

const sprite = document.getElementById("gene-sprite");
sprite.style.marginBottom = `${margins[filename]}px`;
sprite.src = path;
