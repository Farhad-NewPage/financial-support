const createSVGIcon = (icon, anchor, className = "", attr = {}) => {
  const span = document.createElement("span");
  $(span).addClass(className);
  $(span).attr({ ...attr });

  $.ajax({
    url: `../../icons/${icon}.svg`,
    dataType: "xml",
    success: (svgData) => {
      $(span).append(svgData.documentElement);
      $(anchor).append(span);
      $(anchor).attr({ "data-link-type": "internal" });
    },
    error: (error) => reject(error),
  });
};

export default function decorate(block) {
  let className = "oncology-small";

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, colIndex) => {
      $(col).attr({ "data-valign": "middle" });
      if (colIndex === 0) $(col).addClass("columns-col-img");
      if (colIndex === 2 && $(col).text().includes("Access Patient")) {
        className = "custom-paginator";
        $(col).addClass("columns-col-icon");
        $(col).find("a").addClass("icon-button");
        createSVGIcon(
          "chevron-right",
          $(col).find("a"),
          "icon icon-chevron-right",
          { "data-position": "last" }
        );
      }
    });
  });

  $(".personalized-support-container").addClass(
    "section fragment-container gray-bg padding columns-container"
  );
  $(".personalized-support-wrapper").addClass("columns-wrapper");

  if (className.includes("paginator")) {
    $(".access-patient-and-resources.block").addClass(
      "columns block cols-3 " + className
    );
  } else {
    $(".support.block").addClass("columns block cols-3 " + className);
  }
}
