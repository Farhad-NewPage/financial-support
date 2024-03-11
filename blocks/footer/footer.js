import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

const removeParentAndAssignToGrandParent = (section) => {
  let parentElement = $(section).find(".default-content-wrapper");
  let childrenElements = $(parentElement).children();
  $(section).append(childrenElements);
  $(parentElement).remove();
};

const createSVGIcon = (
  icon,
  anchor,
  spanClass = "",
  iconWrapperClass = "",
  attr = {}
) => {
  const span = document.createElement("span");
  const iconWrapper = $(span).clone();
  $(iconWrapper).addClass(iconWrapperClass);
  $(iconWrapper.attr({ ...attr }));

  $(span).text(icon);
  $(span).addClass(spanClass);

  $.ajax({
    url: `../../icons/${icon}.svg`,
    dataType: "xml",
    success: (svgData) => {
      iconWrapper.append(svgData.documentElement);
      $(anchor).empty().append(iconWrapper, span);
    },
    error: (error) => reject(error),
  });
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata("footer");
  block.textContent = "";

  // load footer fragment
  const footerPath = footerMeta.footer || "/footer";
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement("div");
  footer.id = "footer";
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const classes = ["nav", "social", "cta", "menu", "copyright"];

  classes.forEach((c, i) => {
    const section = footer.children[i];
    if (section) {
      section.classList.remove("section");
      section.classList.add(`footer-${c}`);
    }
  });

  const navSections = footer.querySelector(".footer-nav");
  removeParentAndAssignToGrandParent(navSections);
  if (navSections) {
    navSections.querySelectorAll(":scope ul > li").forEach((navSection) => {
      if (navSection.querySelector("ul")) navSection.classList.add("nav-drop");
      else $(navSection).find("a").attr({ "aria-current": "page" });
      $(navSection)
        .contents()
        .filter(function () {
          return this.nodeType === 3 && this.nodeValue.trim() !== "";
        })
        .wrap("<span></span>");
      navSection.addEventListener("click", () => {
        const expanded = navSection.getAttribute("aria-expanded") === "true";
        toggleAllNavSections(navSections);
        navSection.setAttribute("aria-expanded", expanded ? "false" : "true");
      });
    });
  }

  //Social Icons
  const socialSection = footer.querySelector(".footer-social");
  removeParentAndAssignToGrandParent(socialSection);
  const labels = ["facebook", "instagram", "twitter"];
  if (socialSection) {
    socialSection
      .querySelectorAll(":scope ul > li")
      .forEach((item, itemIndex) => {
        const icon = labels[itemIndex];
        const anchor = $(item).find("a");
        $(anchor).addClass("button social-button");
        $(anchor).attr({ title: icon });
        createSVGIcon(icon, anchor, "sr-only", "icon icon-" + icon, {
          "data-position": "only",
        });
      });
  }

  //Menu Section
  const menuSection = footer.querySelector(".footer-menu");

  removeParentAndAssignToGrandParent(menuSection);
  $(menuSection).find("p:first").find("br:first").remove();
  const anchor = $(menuSection).find("a:first");
  createSVGIcon(
    "pfizer-logo-small",
    anchor,
    "sr-only",
    "icon icon-pfizer-small",
    { "data-position": "only" }
  );

  //CopyRight Section
  const copyRightSection = footer.querySelector(".footer-copyright");
  removeParentAndAssignToGrandParent(copyRightSection);

  block.append(footer);
}
