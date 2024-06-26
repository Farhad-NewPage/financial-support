import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia("(min-width: 900px)");

function closeOnEscape(e) {
  if (e.code === "Escape") {
    const nav = document.getElementById("nav");
    const navSections = nav.querySelector(".nav-sections");
    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]'
    );
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector("button").focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === "nav-drop";
  if (isNavDrop && (e.code === "Enter" || e.code === "Space")) {
    const dropExpanded = focused.getAttribute("aria-expanded") === "true";
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest(".nav-sections"));
    focused.setAttribute("aria-expanded", dropExpanded ? "false" : "true");
  }
}

function focusNavSection() {
  document.activeElement.addEventListener("keydown", openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll(".nav-sections > ul > li").forEach((section) => {
    section.setAttribute("aria-expanded", expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded =
    forceExpanded !== null
      ? !forceExpanded
      : nav.getAttribute("aria-expanded") === "true";
  const button = nav.querySelector(".nav-hamburger button");
  document.body.style.overflowY = expanded || isDesktop.matches ? "" : "hidden";
  nav.setAttribute("aria-expanded", expanded ? "false" : "true");
  toggleAllNavSections(navSections, "false");
  button.setAttribute(
    "aria-label",
    expanded ? "Open navigation" : "Close navigation"
  );
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll(".nav-drop");
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute("tabindex")) {
        drop.setAttribute("role", "button");
        drop.setAttribute("tabindex", 0);
        drop.addEventListener("focus", focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute("role");
      drop.removeAttribute("tabindex");
      drop.removeEventListener("focus", focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener("keydown", closeOnEscape);
  } else {
    window.removeEventListener("keydown", closeOnEscape);
  }
}

const removeParentAndAssignToGrandParent = (section) => {
  let parentElement = $(section).find(".default-content-wrapper");
  let childrenElements = $(parentElement).children();
  $(section).append(childrenElements);
  $(parentElement).remove();
};

export const createSVGIcon = (
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
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata("nav");
  const navPath = navMeta ? new URL(navMeta).pathname : "/nav";
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement("nav");
  nav.id = "nav";
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = [
    "brand",
    "utility",
    "sections",
    "cta",
    "support",
    "social",
    "menu",
    "access",
    "language",
    "logo",
  ];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) {
      section.classList.remove("section");
      section.classList.add(`nav-${c}`);
    }
  });

  // Nav Brand
  const navBrand = nav.querySelector(".nav-brand");
  $(navBrand).find("a").attr({ title: "IBRANCE", text: "" });
  const brandLink = navBrand.querySelector(".button");
  if (brandLink) {
    brandLink.className = "";
    brandLink.closest(".button-container").className = "";
  }

  // Nav Utility
  const utilitySection = nav.querySelector(".nav-utility");
  removeParentAndAssignToGrandParent(utilitySection);

  // Nav Section
  const navSections = nav.querySelector(".nav-sections");
  removeParentAndAssignToGrandParent(navSections);
  if (navSections) {
    navSections.querySelectorAll(":scope ul > li").forEach((navSection) => {
      if (navSection.querySelector("ul")) navSection.classList.add("nav-drop");
      // else $(navSection).find("a").attr({ "aria-current": "page" });
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
        this.find("a").attr({ "aria-current": "page" });
      });
    });
  }

  // Nav Menu
  const navMenu = nav.querySelector(".nav-menu");

  if (navMenu) {
    navMenu.querySelectorAll(":scope ul > li").forEach((menu) => {
      //menu.firstElementChild.setAttribute("href", "javascript:void(0)");
      menu.addEventListener("click", function () {
        for (const li of navMenu.querySelectorAll(
          ":scope ul > li.active-menu"
        )) {
          li.classList.remove("active-menu");
        }
        this.classList.add("active-menu");
      });
      return;
    });
  }
  // Registration Button
  const navCta = nav.querySelector(".nav-cta");
  const button = $(navCta).find("p.button-container");
  $(navCta).empty().append(button);

  // Help/Support Section
  const support = nav.querySelector(".nav-support");
  const supportElement = $(support).find("p");
  $(supportElement).find("a").attr({ "data-link-type": "internal" });
  const duplicate = $(supportElement).clone();
  const secondStrongTag = $(duplicate).find("strong:last");
  const helpNumber = $(secondStrongTag).text();
  $(secondStrongTag).empty().append(helpNumber);
  $(support).empty().append(supportElement, duplicate);

  // Social Media
  const socialSection = nav.querySelector(".nav-social");
  const labels = ["facebook", "instagram", "twitter"];
  removeParentAndAssignToGrandParent(socialSection);
  if (socialSection) {
    socialSection
      .querySelectorAll(":scope ul > li")
      .forEach((item, itemIndex) => {
        const anchor = $(item).find("a");
        $(anchor).addClass("button social-button");
        $(anchor).attr({ title: labels[itemIndex] });
        const icon = labels[itemIndex];
        createSVGIcon(icon, anchor, "sr-only", "icon icon-" + icon, {
          "data-position": "only",
        });
      });
  }

  // Nav Language
  const langSection = nav.querySelector(".nav-language");
  removeParentAndAssignToGrandParent(langSection);
  const radioContainer = document.createElement("div");
  const selectedLang = localStorage.getItem("LANGUAGE") || "en";
  if (langSection) {
    const items = langSection.querySelector(":scope ul");
    items.querySelectorAll("li").forEach((option, index) => {
      const container = document.createElement("div");
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "options";
      radio.value = option.textContent.slice(0, 2).toLowerCase();

      if (radio.value === selectedLang) {
        radio.checked = true;
      }

      radio.addEventListener("click", function () {
        let currentLang = option.textContent.slice(0, 2).toLowerCase();
        if (currentLang === localStorage.getItem("LANGUAGE")) {
          return;
        }

        localStorage.setItem("LANGUAGE", currentLang);
        const { pathname } = window.location;
        const strings = pathname.split("/");
        if (currentLang === "en") {
          currentLang = "";
        }
        if (["fr", "sp"].includes(strings[1])) {
          strings.splice(1, 1);
        } else {
          strings.splice(0, 0, currentLang);
        }

        window.location.href = strings.join("/").replace(/\/{2,}/g, "/");
      });

      // Create label element
      var label = document.createElement("label");
      label.textContent = option.textContent;

      // Append radio button and label to container
      container.appendChild(radio);
      container.appendChild(label);
      radioContainer.appendChild(container);
      radioContainer.appendChild(document.createElement("br"));
    });
    items.replaceWith(radioContainer);
  }

  /* Pfizer Logo */
  const logoSection = nav.querySelector(".nav-logo");
  createSVGIcon(
    "pfizer-logo",
    $(logoSection).find("a"),
    "sr-only",
    "icon icon-pfizer-outdo-yesterday"
  );

  // hamburger for mobile
  const hamburger = document.createElement("div");
  hamburger.classList.add("nav-hamburger");
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute("aria-expanded", "false");
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener("change", () =>
    toggleMenu(nav, navSections, isDesktop.matches)
  );

  const anchors = nav.querySelectorAll("a");
  anchors.forEach((anchor) => {
    const { href } = anchor;
    if (href.startsWith("/") || href.endsWith("/")) {
      let currentLang = localStorage.getItem("LANGUAGE");
      currentLang = currentLang !== "en" ? `${currentLang}/` : "";
      anchor.setAttribute("href", `${href + currentLang}`);
    }
  });

  const navWrapper = document.createElement("div");
  navWrapper.className = "nav-wrapper";
  navWrapper.append(nav);
  block.append(navWrapper);
}
