import { addInViewAnimationToSingleElement } from "../../utils/helpers.js";
import { fetchPlaceholders } from "/scripts/aem.js";

// fetch placeholders from the 'en' folder
const placeholders = await fetchPlaceholders("fr");
let globalBlock = null;

function createSelect(fd) {
  const wrapper = document.createElement("div");
  const select = document.createElement("select");
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement("option");
    const { [`${fd.Field.toLowerCase()}Placeholder`]: selectPlaceHolder } =
      placeholders;
    ph.textContent = selectPlaceHolder;
    ph.setAttribute("value", "");
    ph.setAttribute("selected", "");
    ph.setAttribute("disabled", "");
    select.append(ph);
  }
  fd.Options.split(",").forEach((o) => {
    const option = document.createElement("option");
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === "yes") {
    select.setAttribute("required", "required");

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
  // wrapper.appendChild(select);
  return select;
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
  const { [`${fd.Field.toLowerCase()}Label`]: buttonLabel } = placeholders;
  button.textContent = buttonLabel;
  button.setAttribute("id", "submit-button");
  button.classList.add("button");
  if (fd.Type === "submit") {
    button.addEventListener("click", async (event) => {
      const form = button.closest("form");
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      // if (form.checkValidity()) {
      event.preventDefault();
      button.setAttribute("disabled", "");
      await submitForm(form);
      const redirectTo = fd.Extra;
      window.location.href = redirectTo;
      // }
    });
  }

  return button;
}

function createHeading(fd, el) {
  const heading = document.createElement(el);
  heading.textContent = fd.Label;
  return heading;
}

function isInputValid(value, pattern) {
  if (pattern && !eval(pattern).test(value)) {
    return false;
  } else {
    return true;
  }
}

function createInput(fd) {
  const inputWrapper = document.createElement("div");
  const input = document.createElement("input");
  input.type = fd.Type;
  input.id = fd.Field;
  const { [`${fd.Field.toLowerCase()}Placeholder`]: fieldPlaceHolder } =
    placeholders;
  input.setAttribute("placeholder", fieldPlaceHolder);
  if (fd.Mandatory === "yes") {
    input.setAttribute("required", "required");
    input.setAttribute("pattern", fd.pattern);
    input.addEventListener("input", function (event) {
      input.addEventListener("input", function (event) {
        const errorMessage = this.parentNode.querySelector(".error-message");
        if (!isInputValid(event.target.value, fd.pattern)) {
          this.classList.add("invalid");
          if (!errorMessage) {
            const error = document.createElement("div");
            error.classList.add("error-message");
            error.textContent = fd.ErrorMessage;
            inputWrapper.appendChild(error);
          }
        } else {
          this.classList.remove("invalid");
          if (errorMessage) {
            errorMessage.remove();
          }
        }

        updateSubmitButtonState();
      });
    });
  }
  inputWrapper.appendChild(input);
  return inputWrapper;
}

function createTextArea(fd) {
  const input = document.createElement("textarea");
  input.id = fd.Field;
  input.setAttribute("placeholder", fd.Placeholder);
  if (fd.Mandatory === "yes") {
    input.setAttribute("required", "required");
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement("label");
  label.setAttribute("for", fd.Field);
  const { [`${fd.Field.toLowerCase()}Label`]: fieldLabel } = placeholders;
  label.textContent = fieldLabel;
  if (fd.Mandatory === "yes") {
    label.classList.add("required");
  }
  return label;
}

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
  form.setAttribute("id", "regForm");
  const rules = [];
  form.dataset.action = pathname.split(".json")[0];
  json.data.forEach((fd) => {
    fd.Type = fd.Type || "text";
    const fieldWrapper = document.createElement("div");
    const style = fd.Style ? ` form-${fd.Style}` : "";
    const fieldId = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add("field-wrapper");
    switch (fd.Type) {
      case "select":
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case "heading":
        fieldWrapper.append(createHeading(fd, "h3"));
        break;
      case "legal":
        fieldWrapper.append(createHeading(fd, "p"));
        break;
      case "checkbox":
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case "text-area":
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case "submit":
        fieldWrapper.append(createButton(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  form.addEventListener("change", () => applyRules(form, rules));
  applyRules(form, rules);
  fill(form);

  updateSubmitButtonState(form);

  return form;
}

function updateSubmitButtonState(form = globalBlock.querySelector("#regForm")) {
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
    button.removeAttribute("disabled");
  } else {
    button.setAttribute("disabled", "disabled");
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
