// Indy HVAC Pros homepage: callback and contact forms.
// Flow: idle -> submitting -> success | error. Success is shown ONLY after the
// configured endpoint answers with a 2xx. With no endpoint configured, the form
// says so and points to the phone; it never fakes a success.
(function () {
  "use strict";

  var PHONE_DISPLAY = "(317) 627-5668";
  var PHONE_HREF = "tel:+13176275668";

  // Accepts 10 US digits, optionally with a leading 1 / +1.
  function normalizePhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
    return digits.length === 10 ? digits : null;
  }

  function callLink() {
    return '<a href="' + PHONE_HREF + '">' + PHONE_DISPLAY + "</a>";
  }

  function setStatus(form, state, html) {
    var box = form.querySelector(".form-status");
    if (!box) return;
    box.setAttribute("data-state", state);
    var icon = state === "success" ? "icon-check-circle" : state === "error" ? "icon-error-circle" : null;
    box.innerHTML = (icon
      ? '<svg class="icon" aria-hidden="true" focusable="false"><use href="#' + icon + '"></use></svg>'
      : "") + "<span>" + html + "</span>";
  }

  function setFieldError(input, message) {
    var errorEl = document.getElementById(input.id + "-error");
    if (message) {
      input.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validate(form) {
    var firstInvalid = null;
    var fields = form.querySelectorAll("input, textarea");
    for (var i = 0; i < fields.length; i++) {
      var input = fields[i];
      var value = input.value.trim();
      var message = "";
      if (input.required && !value) {
        message = "Please enter your " + (input.getAttribute("data-label") || "details") + ".";
      } else if (input.type === "tel" && value && !normalizePhone(value)) {
        message = "Please enter a 10-digit phone number, like 317-555-0123.";
      }
      setFieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    }
    return firstInvalid;
  }

  function payload(form) {
    var data = { form: form.getAttribute("data-form-name") || "contact", page: location.href };
    var fields = form.querySelectorAll("input, textarea");
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      data[f.name] = f.type === "tel" ? normalizePhone(f.value) : f.value.trim();
    }
    return data;
  }

  function onSubmit(event) {
    var form = event.currentTarget;
    event.preventDefault();
    if (form.getAttribute("data-busy") === "true") return;

    var firstInvalid = validate(form);
    if (firstInvalid) {
      setStatus(form, "error", "Please fix the highlighted field" + (form.querySelectorAll('[aria-invalid="true"]').length > 1 ? "s" : "") + ".");
      firstInvalid.focus();
      return;
    }

    var endpoint = (form.getAttribute("data-endpoint") || "").trim();
    if (!endpoint) {
      setStatus(form, "error",
        "Online requests aren't connected yet, so this wasn't sent. Please call " + callLink() + ".");
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    var label = button ? button.textContent : "";
    form.setAttribute("data-busy", "true");
    if (button) { button.disabled = true; button.textContent = "Sending…"; }
    setStatus(form, "submitting", "Sending your request…");

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload(form))
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      setStatus(form, "success", "Thanks, we got your request. We'll call you at the number you gave.");
    }).catch(function () {
      // Keep everything the visitor typed so they can retry.
      setStatus(form, "error",
        "We couldn't send that. Your details are still filled in, so you can try again, or call " + callLink() + ".");
    }).then(function () {
      form.removeAttribute("data-busy");
      if (button) { button.disabled = false; button.textContent = label; }
    });
  }

  var forms = document.querySelectorAll("form[data-form-name]");
  for (var i = 0; i < forms.length; i++) {
    forms[i].setAttribute("novalidate", "");
    forms[i].addEventListener("submit", onSubmit);
    forms[i].addEventListener("input", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true") setFieldError(e.target, "");
    });
  }
})();
