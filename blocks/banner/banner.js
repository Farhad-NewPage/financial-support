// eslint-disable-next-line no-var
// eslint-disable-next-line no-undef
const $ = jQuery;

export default async function decorate(block) {
  [...block.children].forEach((row, rowIndex) => {
    console.log("Banner ROW IS", rowIndex, row);
    switch (rowIndex) {
      case 0:
        const firstColumn = $(row).children().eq(0);
        $(firstColumn).addClass("hero-banner");
        $(firstColumn).children().eq(0).addClass("hero-banner-img");
        $(firstColumn).prepend('<div class="hero-banner-img-overlay"></div>');

        break;

      case 1:
        $(row).addClass("hero-body");
        $(row)
          .find("h1")
          .addClass("making-your-support-needs-a-priority-together");

        break;

      default:
        break;
    }
  });
}
