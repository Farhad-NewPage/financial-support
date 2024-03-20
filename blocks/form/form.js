import { addInViewAnimationToSingleElement } from "../../utils/helpers.js";

let globalBlock = null;

function createSelect(fd) {
  const select = document.createElement("select");
  select.id = fd.Field;
  if (fd.Placeholder) {
    const ph = document.createElement("option");
    ph.textContent = fd.Placeholder;
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
  if (fd.Mandatory === "x") {
    select.setAttribute("required", "required");
  }
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
  button.textContent = fd.Label;
  button.setAttribute("id", "submit-button");
  button.classList.add("button");
  if (fd.Type === "submit") {
    button.addEventListener("click", async (event) => {
      const form = button.closest("form");
      if (fd.Placeholder) form.dataset.action = fd.Placeholder;
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute("disabled", "");
        await submitForm(form);
        const redirectTo = fd.Extra;
        window.location.href = redirectTo;
      }
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
  input.setAttribute("placeholder", fd.Placeholder);
  if (fd.Mandatory === "x") {
    input.setAttribute("required", "required");
    input.setAttribute("pattern", fd.pattern);
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
  }
  inputWrapper.appendChild(input);
  return inputWrapper;
}

function createTextArea(fd) {
  const input = document.createElement("textarea");
  input.id = fd.Field;
  input.setAttribute("placeholder", fd.Placeholder);
  if (fd.Mandatory === "x") {
    input.setAttribute("required", "required");
  }
  return input;
}

function createLabel(fd) {
  const label = document.createElement("label");
  label.setAttribute("for", fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === "x") {
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
  form.setAttribute("id", "dynamicForm");
  const rules = [];
  // eslint-disable-next-line prefer-destructuring
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
        console.log("RULES ARE", fd.Rules);
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

  updateSubmitButtonState(form, form.querySelector("#submit-button"));

  return form;
}

function updateSubmitButtonState(
  form = globalBlock.querySelector("#dynamicForm")
) {
  const formFields = form.querySelectorAll("input, select");
  let isValid = true;
  formFields.forEach((field) => {
    if (field.required && !isInputValid(field.value, field.pattern)) {
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
  const form = block.querySelector('a[href$=".json"]');
  globalBlock = block;
  addInViewAnimationToSingleElement(block, "fade-up");
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
}
