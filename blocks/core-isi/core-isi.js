export default function decorate(block) {
  const toggleExpandISIBlock = () => {
    const aside = document.querySelector(".core-isi-block-container");
    const isExpanded = aside.getAttribute("aria-expanded");
    aside.setAttribute("aria-expanded", isExpanded === "true" ? false : true);
    aside.setAttribute(
      "aria-label",
      isExpanded === "true"
        ? "Important Safety Information & Use - Fully Expanded"
        : "Important Safety Information And Indications - Collapsed"
    );
    document
      .querySelector(".core-persistent-isi-container")
      .classList.toggle("is-pinned");
  };

  const createButton = (isCollapseButton = false) => {
    const button = document.createElement("button");
    button.classList.add("button", "button-m", "inverted");

    if (isCollapseButton) {
      button.classList.add("collapse-isi", "secondary");
      //button.setAttribute("aria-expanded", "false");
    } else button.classList.add("toggle-isi", "primary");

    button.setAttribute(
      "aria-label",
      "Important Safety Information And Indications"
    );
    // button.setAttribute("aria-controls", "isi");
    button.setAttribute("data-smartcapture", "isi-open");

    if (!isCollapseButton) {
      const expandText = document.createElement("span");
      expandText.textContent = "+";
      expandText.classList.add("expand-text");
      button.appendChild(expandText);
    }
    const collapseText = document.createElement("span");
    collapseText.textContent = "-";
    collapseText.classList.add("collapse-text");
    button.appendChild(collapseText);

    const iconSpan = document.createElement("span");
    iconSpan.classList.add("icon", "icon-lib-arrow-down");
    iconSpan.setAttribute("aria-label", "Icon - lib-arrow-down");
    iconSpan.setAttribute("data-icon-loaded", "true");

    $.ajax({
      url: `../../icons/sprite-lib-arrow-down.svg`,
      dataType: "xml",
      success: (svgData) => {
        iconSpan.append(svgData.documentElement);
        button.append(iconSpan);
      },
      error: (error) => reject(error),
    });

    button.addEventListener("click", toggleExpandISIBlock);
    return button;
  };

  [...block.children].forEach((row, rowIndex) => {
    switch (rowIndex) {
      case 0:
        $(row).addClass("core-isi-header-container");
        row.children[0].classList.add("core-isi-header");

        const title = row.children[0].textContent.trim();

        const titleSpan = document.createElement("span");
        titleSpan.classList.add("core-isi-title");
        titleSpan.textContent = title;

        const buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("core-isi-buttons");
        buttonsContainer.appendChild(createButton());
        buttonsContainer.appendChild(createButton(true));

        while (row.children[0].firstChild) {
          row.children[0].removeChild(row.children[0].firstChild);
        }

        row.children[0].appendChild(titleSpan);
        row.children[0].appendChild(buttonsContainer);

        break;

      case 1:
        row.classList.add(
          "core-isi-inside",
          "block-inside",
          "core-isi-inside-cols"
        );
        row.children[0].classList.add("col-one");
        row.children[1].classList.add("col-two");

        const firstLevelWrapper = document.createElement("div");
        firstLevelWrapper.classList.add("default-content-wrapper");

        const firstColumnChildren = row.children[0].children;
        // Iterate over the children and move them to the wrapper
        while (firstColumnChildren.length) {
          firstLevelWrapper.appendChild(firstColumnChildren[0]);
        }

        const secondLevelWrapper = document.createElement("div");
        secondLevelWrapper.classList.add(
          "core-isi-content",
          "section",
          "break-after"
        );

        secondLevelWrapper.append(firstLevelWrapper);

        while (row.children[0].firstChild) {
          row.children[0].removeChild(row.children[0].firstChild);
        }

        row.children[0].appendChild(secondLevelWrapper);

        const colTwoFirstLevelWrapper = document.createElement("div");
        colTwoFirstLevelWrapper.classList.add("default-content-wrapper");
        const secondColumnChildren = row.children[1].children;
        // // Iterate over the children and move them to the wrapper
        while (secondColumnChildren.length) {
          colTwoFirstLevelWrapper.appendChild(secondColumnChildren[0]);
        }

        const colTwoSecondLevelWrapper = document.createElement("div");
        colTwoSecondLevelWrapper.classList.add("core-isi-content", "section");

        colTwoSecondLevelWrapper.appendChild(colTwoFirstLevelWrapper);

        while (row.children[1].firstChild) {
          row.children[1].removeChild(row.children[1].firstChild);
        }

        row.children[1].append(colTwoSecondLevelWrapper);

        const rowCopy = row.cloneNode(true);

        const coreISIContentDiv = document.createElement("div");
        coreISIContentDiv.classList.add("core-isi-content");
        coreISIContentDiv.appendChild(rowCopy);

        const coreISIContentContainerDiv = document.createElement("div");
        coreISIContentContainerDiv.classList.add("core-isi-content-container");
        coreISIContentContainerDiv.appendChild(coreISIContentDiv);

        const coreISIContentScrollParentDiv = document.createElement("div");
        coreISIContentScrollParentDiv.classList.add(
          "core-isi-content-scroll-parent"
        );
        coreISIContentScrollParentDiv.appendChild(coreISIContentContainerDiv);

        row.replaceWith(coreISIContentScrollParentDiv);

        break;

      default:
        break;
    }
  });

  const aside = document.createElement("aside");
  aside.classList.add("core-isi-block-container");
  aside.setAttribute(
    "aria-label",
    "Important Safety Information And Indications - Collapsed"
  );
  aside.setAttribute("aria-expanded", false);
  const children = block.children;

  while (children.length) {
    aside.appendChild(children[0]);
  }
  const corePersistentISIContainer = document.createElement("div");
  corePersistentISIContainer.classList.add(
    "core-persistent-isi-container",
    "core-scrollbar",
    "core-isi-two-buttons",
    "is-pinned",
    "was-expanded"
  );
  corePersistentISIContainer.style.marginBottom = "5408px";
  corePersistentISIContainer.style.setProperty(
    "--core-isi--collapsed-height-current",
    "56px"
  );
  corePersistentISIContainer.appendChild(aside);

  block.append(corePersistentISIContainer);

  const coreISIContainer = document.querySelector(
    ".section.core-isi-container"
  );
  coreISIContainer.style.display = "block";

  const oncologyContent = document.querySelector(".oncology-together");
  const footer = document.querySelector(".footer-wrapper");

  window.addEventListener("scroll", function () {
    const contentBottom = oncologyContent.getBoundingClientRect().bottom;
    const footerTop = footer.getBoundingClientRect().bottom - 600;
    const aside = document.querySelector(".core-isi-block-container");
    if (window.innerHeight < contentBottom + 50) {
      aside.setAttribute("aria-expanded", true);
      aside.setAttribute(
        "aria-label",
        "Important Safety Information & Use - Fully Expanded"
      );
      document
        .querySelector(".core-persistent-isi-container")
        .classList.add("is-pinned");
    } else {
      aside.setAttribute("aria-expanded", false);
      aside.setAttribute(
        "aria-label",
        "Important Safety Information & Use - Collapsed"
      );
      document
        .querySelector(".core-persistent-isi-container")
        .classList.remove("is-pinned");
    }
  });
}
