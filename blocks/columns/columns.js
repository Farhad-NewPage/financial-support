export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  // Setup image columns
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    const col1 = cols[0];

    [...row.children].forEach((col, colIndex) => {
      const paragraphs = col.querySelectorAll("p");
      if (paragraphs.length > 0) {
        paragraphs[0].classList.add("center");
      }
      if (colIndex === 0) {
        const desktopLogo = col.querySelector("picture");
        if (desktopLogo) {
          const sources = desktopLogo.querySelectorAll("source");
          sources.forEach((source) => {
            source.media = "(min-width: 600px)";
          });
          const img = desktopLogo.querySelector("img");
          if (img) {
            img.width = 201;
            img.height = 150;
          }
        }

        const mobileLogo = col.querySelector("picture:nth-of-type(2)");
        if (mobileLogo) {
          mobileLogo.classList.add("icon", "icon-pot-logo");
        } else {
          const firstRowCol = row.querySelector(":first-child");
          const mobileLogoInFirstCol = firstRowCol.querySelector(
            "p > picture:nth-of-type(2)"
          );
          if (mobileLogoInFirstCol) {
            mobileLogoInFirstCol.classList.add("icon", "icon-pot-logo");
            col.insertBefore(mobileLogoInFirstCol, col.firstChild);
          }
        }
      }
    });
  });
}
