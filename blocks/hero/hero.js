import { createOptimizedPicture } from "../../scripts/aem.js";

const $ = jQuery;

export default async function decorate(block) {
  [...block.children].forEach((row, rowIndex) => {
    switch (rowIndex) {
      case 0:
        $(row).addClass("hero-banner");
        const firstColumn = $(row).children().eq(0);
        $(firstColumn).addClass("hero-banner-img");
        $(firstColumn).prepend('<div class="hero-banner-img-overlay"></div>');

        const source = $(firstColumn).find("picture img").attr("src");
        const optPicture = createOptimizedPicture(
          source,
          "Banner Image",
          true,
          [{ media: "(min-width: 600px)", width: "1280" }, { width: "420" }]
        );

        $(firstColumn).find("picture").replaceWith(optPicture);
        break;

      case 1:
        $(row).addClass("hero-body");
        $(row)
          .find("h1")
          .attr({ id: "making-your-support-needs-a-priority-together" });

        break;

      default:
        break;
    }
  });

  $(block)
    .closest(".hero-container")
    .addClass(
      "section hero-container hero-full-width-container hero-text-overlay-container"
    );
  $(block).addClass(
    "hero text-overlay frosted-light light content-50 op-85 block"
  );
}
