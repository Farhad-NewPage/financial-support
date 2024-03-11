export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      $(col).find("p").first().addClass("center");
      const DesktopLogo = $(col).find("picture").first();
      $(DesktopLogo)
        .children()
        .each(function (index, element) {
          if (element.tagName === "SOURCE") {
            $(element).attr("media", "(min-width: 600px)");
          } else if (element.tagName === "IMG") {
            $(element).attr({ width: 201, height: 150 });
          }
        });

      const mobileLogo = $(col).find("picture:eq(1)");
      if (mobileLogo.length) {
        $(mobileLogo).addClass("icon icon-pot-logo");
      } else {
        const mobileLogo = $(row).children(":first").find("p > picture:eq(1)");
        $(mobileLogo).addClass("icon icon-pot-logo");

        $(col).prepend(mobileLogo);
      }
    });
  });
}
