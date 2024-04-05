export default function decorate(block) {
  [...block.children].forEach((row, rowIndex) => {
    switch (rowIndex) {
      case 0:
        $(row).addClass("isi-head");
        row.children[0].classList.add("section");
        row.children[0].children[0].setAttribute(
          "id",
          "important-safety-information--use"
        );
        row.children[1].classList.add(
          "button-container",
          "button-container-multi",
          "isi-button-container"
        );

        const button = document.createElement("button");
        button.classList.add("button");
        button.setAttribute("type", "button");
        button.setAttribute("data-action", "Expand");
        button.setAttribute("aria-controls", "isi");
        button.setAttribute(
          "aria-label",
          "Important Safety Information & Use - Fully Expanded"
        );

        const labelSpan = document.createElement("span");
        labelSpan.classList.add("isi-toggle-text");
        labelSpan.textContent = row.children[1].textContent;

        const svgSpan = document.createElement("span");
        svgSpan.classList.add("icon", "icon-isi-arrow-up");

        while (row.children[1].firstChild) {
          row.children[1].removeChild(row.children[1].firstChild);
        }

        $.ajax({
          url: `../../icons/arrow-up-icon.svg`,
          dataType: "xml",
          success: (svgData) => {
            svgSpan.append(svgData.documentElement);
            button.append(labelSpan);
            button.append(svgSpan);

            row.children[1].append(button);
            const secondColumn = row.children[1];

            row.removeChild(row.children[1]);
            row.children[0].append(secondColumn);
          },
          error: (error) => reject(error),
        });

        break;

      case 1:
        row.classList.add("isi-body");
        row.children[0].classList.add("section");
        row.children[1].classList.add("section");

        const firstContentWrapper = document.createElement("div");
        firstContentWrapper.classList.add("default-content-wrapper");

        const firstColumnChildren = row.children[0].children;
        // Iterate over the children and move them to the wrapper
        while (firstColumnChildren.length) {
          firstContentWrapper.appendChild(firstColumnChildren[0]);
        }
        row.children[0].append(firstContentWrapper);

        const secondContentWrapper = document.createElement("div");
        secondContentWrapper.classList.add("default-content-wrapper");
        const secondColumnChildren = row.children[1].children;
        // // Iterate over the children and move them to the wrapper
        while (secondColumnChildren.length) {
          secondContentWrapper.appendChild(secondColumnChildren[0]);
        }
        row.children[1].append(secondContentWrapper);

        break;

      default:
        break;
    }
  });

  const aside = document.createElement("aside");
  aside.setAttribute(
    "aria-label",
    "Important Safety Information & Use - Fully Expanded"
  );
  aside.setAttribute("aria-expanded", true);
  const children = block.children;

  while (children.length) {
    aside.appendChild(children[0]);
  }
  block.append(aside);

  block.setAttribute("data-state", "partial");

  const oncologyContent = document.querySelector(".oncology-together");
  const footerTop = document.querySelector(".footer-wrapper");

  window.addEventListener("scroll", function () {
    const contentBottom = oncologyContent.getBoundingClientRect().bottom;
    if (window.innerHeight > contentBottom) {
      block.setAttribute("data-state", "inline");
    } else {
      block.setAttribute("data-state", "partial");
    }
  });
}
