import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from "./aem.js";

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector("h1");
  const picture = main.querySelector("picture");
  // eslint-disable-next-line no-bitwise
  if (
    h1 &&
    picture &&
    h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING
  ) {
    // const section = document.createElement("div");
    // section.append(buildBlock("hero", { elems: [picture, h1] }));
    // main.prepend(section);

    const banner = `<div class="section hero-container hero-full-width-container hero-text-overlay-container" data-section-status="loaded" data-="" style="">
    <div class="hero-wrapper">
        <div class="hero block text-overlay frosted-light light content-50 op-85" data-block-name="hero" data-block-status="loaded">
            <div class="hero-banner">
              <div class="hero-banner-img">
              <div class="hero-banner-img-overlay"></div>
                ${picture}
              </div>
            </div>
  
            <div class="hero-body">
              <div>
                ${h1}
              </div>
            </div>
        </div>
      </div>
    </div>`;

    main.append(banner);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes("localhost"))
      sessionStorage.setItem("fonts-loaded", "true");
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Auto Blocking failed", error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = "en";
  decorateTemplateAndTheme();
  const main = doc.querySelector("main");
  if (main) {
    decorateMain(main);
    document.body.classList.add("appear");
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem("fonts-loaded")) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector("main");
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector("header"));
  loadFooter(doc.querySelector("footer"));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM("lazy");
  sampleRUM.observe(main.querySelectorAll("div[data-block-name]"));
  sampleRUM.observe(main.querySelectorAll("picture > img"));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import("./delayed.js"), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

/*
<div class="section hero-container hero-full-width-container hero-text-overlay-container" data-section-status="loaded" data-="" style="">
  <div class="hero-wrapper">
      <div class="hero block text-overlay frosted-light light content-50 op-85" data-block-name="hero" data-block-status="loaded">
          
          <div class="hero-banner">
            <div class="hero-banner-img">
            <div class="hero-banner-img-overlay"></div>
              <picture>
                <source type="image/webp" srcset="./media_1e82107b7e975abc5e3531f73565933dcfc875694.jpeg?width=2000&amp;format=webply&amp;optimize=medium" media="(min-width: 600px)">
                <source type="image/webp" srcset="./media_1e82107b7e975abc5e3531f73565933dcfc875694.jpeg?width=750&amp;format=webply&amp;optimize=medium" media="(min-width: 600px)">
                <source type="image/jpeg" srcset="./media_1e82107b7e975abc5e3531f73565933dcfc875694.jpeg?width=2000&amp;format=jpeg&amp;optimize=medium" media="(min-width: 600px)">
                <img loading="eager" alt="Banner Image" src="./media_1e82107b7e975abc5e3531f73565933dcfc875694.jpeg?width=750&amp;format=jpeg&amp;optimize=medium" width="1280" height="420" fetchpriority="high">
              </picture>
            </div>
          </div>

          <div class="hero-body">
            <div>
              <h1 id="making-your-support-needs-a-priority-together">Making Your Support Needs A Priority.<br>Together.</h1>
            </div>
          </div>
      </div>
    </div>
  </div>

*/
