export default function decorate(block) {
  const aside = document.createElement("aside");
  $(aside).attr({
    "aria-label": "Important Safety Information & Use - Fully Expanded",
    "aria-expanded": true,
  });
  /*
  [...block.children].forEach((row, rowIndex) => {
    switch (rowIndex) {
      case 0:
        $(row).addClass("isi-head");
        // $(row).children().eq(0).addClass("section");
        break;

      case 1:
        $(row).addClass("isi-body");
        //$(row).children().eq(0).addClass("section");
        //$(row).children().eq(1).addClass("section");
        break;

      default:
        break;
    }
  });
 */
  // block.append(aside);
}
