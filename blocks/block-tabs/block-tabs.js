const createTab = (tab, index, className) => {
  const id = toClassName(tab.textContent);
  const button = document.createElement("button");
  button.className = className || "tab-btn";
  button.id = `tab-${id}`;
  button.innerHTML = tab.innerHTML;
  button.setAttribute("aria-controls", `tabpanel-${id}`);
  button.setAttribute("aria-selected", !index);
  button.setAttribute("role", "tab");
  button.setAttribute("type", "button");

  return button;
};

function toClassName(name) {
  return typeof name === "string"
    ? name
        .toLowerCase()
        .replace(/[^0-9a-z]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "";
}

function hasWrapper(el) {
  return (
    !!el.firstElementChild &&
    window.getComputedStyle(el.firstElementChild).display === "block"
  );
}

const createPanel = (tab, row, rowIndex) => {
  const button = createTab(tab, rowIndex, "tab-inner-btn");
  $(row).prepend(button);

  const wrapElements = (element, start, end, className = "") => {
    const wrapper = document.createElement("div");
    $(wrapper).addClass(className);
    return $(element)
      .children(
        end === 2 ? ":lt(" + end + ")" : ":gt(" + start + "):lt(" + end + ")"
      )
      .wrapAll(wrapper);
  };

  [...row.children].forEach((column, columnIndex) => {
    $(column).addClass("section columns-container");
    $(column).attr({ "data-tab": "insured, " + rowIndex + 1 });
    if (columnIndex !== 0 && rowIndex === 0) {
      wrapElements(column, 0, 2, "default-content-wrapper");
      wrapElements(column, 0, 4, "columns-wrapper tabs-columns-wrapper");
      wrapElements(column, 1, 10, "default-content-wrapper");

      $(".tabs-columns-wrapper")
        .children(":first")
        .replaceWith(function () {
          return $("<div>", { html: $(this).html(), class: "columns-col-img" });
        });
      wrapElements($(".tabs-columns-wrapper"), 0, 4, "");

      $(".columns-col-img")
        .find("picture")
        .children()
        .each(function (index, element) {
          if (element.tagName === "SOURCE") {
            $(element).attr("media", "(min-width: 600px)");
          } else if (element.tagName === "IMG") {
            $(element).attr({ width: 971, height: 611 });
          }
        });

      wrapElements($(".tabs-columns-wrapper"), 0, 2);
      wrapElements(
        $(".tabs-columns-wrapper"),
        0,
        2,
        "columns original no-padding margin-top margin-bottom mobile-img-radius block cols-2"
      );
    }
  });
  return row;
};

export default async function decorate(block) {
  // build tablist
  const tablistContainer = document.createElement("div");
  tablistContainer.className = "tab-list-container";
  tablistContainer.setAttribute("role", "tablist");

  const tabContentContainer = document.createElement("div");
  $(tabContentContainer).addClass("tab-content-container");

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = createPanel(tab, block.children[i], i);
    tabpanel.className = "tabpanel";
    tabpanel.id = `tab-panel-insured-${id}`;
    tabpanel.setAttribute("aria-hidden", !!i);
    tabpanel.setAttribute("aria-labelledby", `tab-${id}`);
    tabpanel.setAttribute("role", "tabpanel");
    if (!hasWrapper(tabpanel.lastElementChild)) {
      tabpanel.lastElementChild.innerHTML = `<p>${tabpanel.lastElementChild.innerHTML}</p>`;
    }

    const button = createTab(tab, i, "tab-btn");

    button.addEventListener("click", () => {
      block.querySelectorAll("[role=tabpanel]").forEach((panel) => {
        panel.setAttribute("aria-hidden", true);
      });
      tablistContainer.querySelectorAll("button").forEach((btn) => {
        btn.setAttribute("aria-selected", false);
      });
      tabpanel.setAttribute("aria-hidden", false);
      button.setAttribute("aria-selected", true);
    });

    tablistContainer.append(button);
    tab.remove();
  });

  const tablist = document.createElement("div");
  tablist.className = "tab-list";
  tablist.append(tablistContainer);

  const allTabsPanel = block.querySelectorAll(".tabpanel");

  allTabsPanel.forEach(function (element) {
    $(tabContentContainer).append(element);
  });

  allTabsPanel.forEach(function (element) {
    $(element).remove;
  });

  const tabContent = document.createElement("div");
  $(tabContent).addClass("tab-content");
  $(tabContent).append(tabContentContainer);

  block.classList.add("center", "tabs-mobile-alignment");
  block.prepend(tablist);
  block.append(tabContent);
}
