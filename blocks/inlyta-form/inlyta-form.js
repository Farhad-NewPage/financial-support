import { addInViewAnimationToSingleElement } from "../../utils/helpers.js";

let globalBlock = null;

function createSelect(fd) {
  const wrapper = document.createElement("div");
  wrapper.classList.add(
    "block-171887-cid",
    "block-70390-cid",
    "form-input",
    "select-input",
    "form-50"
  );
  const select = document.createElement("select");
  select.setAttribute("aria-hidden", "true");
  select.setAttribute("id", "select");
  select.setAttribute("tab-index", -1);
  select.setAttribute("data-select2-id", "select2-data-state");
  // select.classList.add("select2-hidden-accessible");
  select.id = fd.Field;

  if (fd.Placeholder) {
    const ph = document.createElement("option");
    ph.textContent = fd.Placeholder;
    ph.setAttribute("value", "");
    ph.setAttribute("selected", "");
    ph.setAttribute("disabled", "");
    select.append(ph);
  }
  fd.Options.split(",").forEach((o, index) => {
    const option = document.createElement("option");
    option.textContent = o.trim();
    option.setAttribute("data-select2-id", `${index}_${o.trim()}`);
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === "yes") {
    // select.setAttribute("required", "required");

    select.addEventListener("change", function () {
      /*
      const errorMessage = this.parentNode.querySelector(".error-message");
      const selectedOption = select.value;
      if (selectedOption === select.getAttribute("placeholder")) {
        this.classList.add("invalid");
        if (!errorMessage) {
          const error = document.createElement("div");
          error.classList.add("error-message");
          error.textContent = fd.ErrorMessage;
          wrapper.appendChild(error);
        }
      } else {
        this.classList.remove("invalid");
        if (errorMessage) {
          errorMessage.remove();
        }
      }
      */
      updateSubmitButtonState();
    });
  }

  const spanOne = document.createElement("span");
  spanOne.classList.add(
    "select2",
    "select2-container",
    "select2-container--default",
    "option-selected",
    "select2-container--above"
  );

  const spanTwo = document.createElement("span");
  spanTwo.classList.add("selection");

  const spanThree = document.createElement("span");
  spanThree.classList.add("select2-selection", "select2-selection--single");
  spanThree.setAttribute("role", "combobox");
  spanThree.setAttribute("aria-haspopup", "true");
  spanThree.setAttribute("aria-expanded", "false");
  spanThree.setAttribute("aria-disabled", "false");

  const spanFour = document.createElement("span");
  spanFour.classList.add("select2-selection__rendered");
  spanFour.setAttribute("role", "textbox");
  spanFour.setAttribute("aria-readonly", "true");

  spanThree.appendChild(spanFour);

  spanTwo.appendChild(spanThree);

  const spanFive = document.createElement("span");
  spanFive.classList.add("dropdown-wrapper");
  spanFive.setAttribute("aria-hidden", "true");

  spanOne.appendChild(spanTwo);
  spanOne.appendChild(spanFive);

  wrapper.appendChild(createLabel(fd));
  wrapper.appendChild(select);
  //wrapper.appendChild(spanOne);

  return wrapper;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === "checkbox") {
      if (fe.checked) payload[fe.id] = fe.value;
    } else if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });

  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  payload.timestamp = new Date().toJSON();
  delete payload["submit-button"];
  delete payload["confirm_email"];
  const resp = await fetch(
    `https://admin.hlx.page/form/farhad-newpage/financial-support/en${form.dataset.action}.json`,
    {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    }
  );
  await resp.text();
  return payload;
}

function createButton(fd) {
  const button = document.createElement("button");
  button.textContent = fd.Label;
  button.setAttribute("id", "submit-button");
  button.classList.add("block-171887-cid", "block-70390-cid", "btn-callout");
  if (fd.Type === "submit") {
    button.addEventListener("click", async (event) => {
      const form = button.closest("form");
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      event.preventDefault();
      button.setAttribute("disabled", "");
      button.setAttribute("textContent", "Submitting...");
      await submitForm(form);
      const redirectTo = fd.Extra;
      window.location.href = redirectTo;
    });
  }

  return button;
}

function createHeading(fd, el) {
  const heading = document.createElement(el);
  heading.textContent = fd.Label;
  return heading;
}

function createElement(fd, el, classes = "") {
  const element = document.createElement(el);
  element.textContent = fd.Label;
  if (classes) element.classList.add(classes);
  return element;
}

function isInputValid(value, pattern) {
  if (pattern && !eval(pattern).test(value)) {
    return false;
  } else {
    return true;
  }
}

function createLabel(fd) {
  const label = document.createElement("label");
  label.setAttribute("for", fd.Field);
  label.innerHTML =
    fd.Label + (fd.Mandatory === "yes" ? "<sup id='i1ykh'>*</sup>" : "");

  return label;
}

function createInput(fd) {
  const inputWrapper = document.createElement("div");
  inputWrapper.classList.add(
    "block-171887-cid",
    "block-70390-cid",
    "form-input"
  );
  inputWrapper.appendChild(createLabel(fd));
  const input = document.createElement("input");
  input.type = fd.Type;
  input.id = fd.Field;
  input.setAttribute("placeholder", fd.Placeholder);
  if (fd.Mandatory === "yes") {
    input.setAttribute("required", "required");
    input.setAttribute("pattern", fd.pattern);
    input.addEventListener("input", function (event) {
      input.addEventListener("input", function (event) {
        if (!isInputValid(event.target.value, fd.pattern)) {
          this.classList.add("error");
        } else {
          if (fd.Field === "confirm_email") {
            const emailValue = document.getElementById("email").value;
            if (emailValue !== event.target.value) {
              this.classList.add("error");
            } else {
              this.classList.remove("error");
            }
          } else {
            this.classList.remove("error");
          }
        }
        updateSubmitButtonState();
      });
    });
  }
  inputWrapper.appendChild(input);
  return inputWrapper;
}

function createCheckbox(fd, option) {
  const inputWrapper = document.createElement("div");
  inputWrapper.classList.add(
    "block-171887-cid",
    "form-input",
    "checkbox-input"
  );

  const optionWrapper = document.createElement("div");
  optionWrapper.classList.add("checker");

  const span = document.createElement("span");
  span.classList.add("error");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = option.trim();
  input.id = `kitReceived`;
  input.classList.add("block-171887-cid", "inlyta-kit-received");

  span.appendChild(input);
  optionWrapper.appendChild(span);

  span.addEventListener("click", function (event) {
    const options = document.querySelectorAll("div.checker > span > input");
    options.forEach((_option) => {
      if (_option !== event.target) {
        _option.closest("span").classList.remove("checked");
      }
    });

    this.classList.toggle("checked");
  });

  const label = document.createElement("label");
  label.setAttribute("for", fd.Field);
  label.textContent = option.trim();

  inputWrapper.appendChild(optionWrapper);
  inputWrapper.appendChild(label);
  return inputWrapper;
}

function createCard(fd) {
  const images = {
    savings: "../../icons/inlyta-copy-card.svg",
    insiders: "../../icons/inlyta-insiders-logo.svg",
  };

  /* HEADER  */
  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.classList.add("checker");

  const span = document.createElement("span");
  //span.classList.add("checked");

  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = fd.Type.includes("savings") ? 1 : 2;
  input.id = fd.Type.includes("savings")
    ? "savings_checkbox"
    : "insiders_checkbox";
  input.classList.add("block-171887-cid", "block-70390-cid", "form-category");
  span.appendChild(input);

  span.addEventListener("click", function (event) {
    this.classList.toggle("checked");
    this.closest(".form-type-option").classList.toggle("selected");
  });

  checkboxWrapper.appendChild(span);

  const image = document.createElement("img");
  image.setAttribute(
    "src",
    fd.Field.includes("savings") ? images["savings"] : images["insiders"]
  );

  const header = document.createElement("div");
  header.classList.add(
    "block-171887-cid",
    "block-70390-cid",
    "form-type-header"
  );
  header.appendChild(image);
  header.appendChild(checkboxWrapper);
  /* END OF HEADER */

  const heading4 = document.createElement("h4");
  heading4.textContent = fd.Label.split("\n")[0];

  const blankParagraph = document.createElement("p");

  const paragraph = document.createElement("p");
  paragraph.textContent = fd.Label.split("\n")[1];

  const container = document.createElement("div");
  container.classList.add("block-171887-cid", "form-type-option");

  container.appendChild(header);
  container.appendChild(heading4);
  container.appendChild(blankParagraph);
  container.appendChild(paragraph);

  return container;
}

const sections = {
  personalInfo: {
    id: "i9dlv",
    classes: ["block-171887-cid", "block-70390-cid", "basic-details"],
    h4: "Personal Information",
  },
  welcomeKit: {
    id: "igoxtd",
    classes: ["block-171887-cid", "block-70390-cid", "patient-kit-field"],
  },
  shippingInfo: {
    id: "iek3gg",
    classes: ["block-171887-cid", "block-70390-cid", "shipping-address"],
    h4: "Shipping Address",
  },
  footerText: {
    id: "i70jdi",
    classes: ["block-171887-cid", "block-70390-cid", "form-footer-text"],
  },
};

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const {
      type,
      condition: { key, operator, value },
    } = field.rule;
    if (type === "visible") {
      if (operator === "eq") {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove("hidden");
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add("hidden");
        }
      }
    }
  });
}

function fill(form) {
  const { action } = form.dataset;
  if (action === "/tools/bot/register-form") {
    const loc = new URL(window.location.href);
    form.querySelector("#owner").value = loc.searchParams.get("owner") || "";
    form.querySelector("#installationId").value =
      loc.searchParams.get("id") || "";
  }
}

export async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement("form");
  form.setAttribute("id", "sign-up-form");
  form.classList.add("sign-up-wrapper");
  const rules = [];
  form.dataset.action = pathname.split(".json")[0];
  let section = null;
  const formWrapper = document.createElement("div");
  formWrapper.classList.add(
    "block-171887-cid",
    "block-70390-cid",
    "form-wrapper"
  );

  const formTypeSelectionWrapper = document.createElement("div");
  formTypeSelectionWrapper.classList.add(
    "block-171887-cid",
    "block-70390-cid",
    "form-type-selection"
  );

  json.data.forEach((fd) => {
    fd.Type = fd.Type || "text";

    switch (fd.Type) {
      case "select":
        section.append(createSelect(fd));
        break;
      case "paragraph":
        if (section) section.append(createElement(fd, "p", fd.Style));
        else formWrapper.appendChild(createElement(fd, "p", fd.Style));
        break;
      case "checkbox":
        section.append(createHeading(fd, "h4"));

        fd.Options.split(",").forEach((option) => {
          section.append(createCheckbox(fd, option));
        });
        break;
      case "card":
        formTypeSelectionWrapper.appendChild(createCard(fd));
        break;
      case "submit":
        if (section) {
          formWrapper.appendChild(section);
          section = null;
        }
        formWrapper.append(createButton(fd));
        break;

      case "section":
        if (section) {
          formWrapper.appendChild(section);
        }
        section = document.createElement("div");
        section.classList.add(...sections[fd.Field].classes);
        section.setAttribute("id", sections[fd.Field].id);
        if (sections[fd.Field].h4) {
          const heading = document.createElement("h4");
          heading.innerText = sections[fd.Field].h4;
          section.append(heading);
        }
        break;
      default:
        section.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
  });

  form.appendChild(formTypeSelectionWrapper);
  form.appendChild(formWrapper);
  form.addEventListener("change", () => applyRules(form, rules));
  applyRules(form, rules);
  fill(form);

  updateSubmitButtonState(form);

  return form;
}

function updateSubmitButtonState(
  form = globalBlock.querySelector("#sign-up-form")
) {
  const formFields = form.querySelectorAll("input, select");
  let isValid = true;
  formFields.forEach((field) => {
    if (
      ["text", "email"].includes(field.type) &&
      field.required &&
      !isInputValid(field.value, field.pattern)
    ) {
      isValid = false;
    } else if (field.type === "select-one" && field.value === "") {
      isValid = false;
    }
  });

  const button = form.querySelector("#submit-button");

  if (isValid) {
    // button.removeAttribute("disabled");
  } else {
    // button.setAttribute("disabled", "disabled");
  }
}

export default async function decorate(block) {
  const { pathname } = window.location;
  const splitString = pathname.includes("/en") ? "/en" : "/";
  const pathStrings = pathname.split(splitString);
  const directory = pathStrings.length > 2 ? pathStrings[1] : pathStrings[0];
  const form = block.querySelector('a[href$=".json"]');
  // Get the current href attribute value
  const currentHref = form.getAttribute("href");
  // Set the new href attribute value
  if (!currentHref.startsWith(directory)) {
    form.setAttribute("href", `/${directory}${currentHref}`);
  }
  globalBlock = block;
  addInViewAnimationToSingleElement(block, "fade-up");
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
