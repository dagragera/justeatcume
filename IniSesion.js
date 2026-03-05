(() => {
  "use strict";

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("pass");
  const toggleBtn = document.getElementById("togglePassword");
  const formMessages = document.getElementById("formMessages");

  const EMAIL_MAX = 120;
  const PASS_MIN = 8;
  const PASS_MAX = 64;

  function clearChildren(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /**
   * Crea un elemento con texto usando los 4 pasos:
   * 1) createElement
   * 2) createTextNode
   * 3) appendChild(text)
   * 4) appendChild(element) en el contenedor destino (se hace fuera)
   */
  function buildTextElement(tagName, text, className, attrs) {
    // 1) Crear nodo Element
    const el = document.createElement(tagName);

    if (className) el.className = className;

    if (attrs && typeof attrs === "object") {
      Object.keys(attrs).forEach((key) => el.setAttribute(key, String(attrs[key])));
    }

    // 2) Crear nodo Text
    const txt = document.createTextNode(text);

    // 3) Añadir Text como hijo del Element
    el.appendChild(txt);

    return el;
  }

  function setFormMessage(text, type) {
    clearChildren(formMessages);

    const klass = type === "ok" ? "msg msg--ok" : "msg msg--error";
    const msg = buildTextElement("div", text, klass, { role: "status" });

    // 4) Añadir Element al DOM (como hijo del contenedor)
    formMessages.appendChild(msg);
  }

  function getErrorIdFor(input) {
    return `err-${input.id}`;
  }

  function removeFieldError(input) {
    const errId = getErrorIdFor(input);
    const existing = document.getElementById(errId);
    if (existing) existing.remove();

    input.classList.remove("is-invalid");

    const describedBy = input.getAttribute("aria-describedby") || "";
    const parts = describedBy
      .split(" ")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((id) => id !== errId);

    if (parts.length > 0) input.setAttribute("aria-describedby", parts.join(" "));
    else input.removeAttribute("aria-describedby");
  }

  function addFieldError(input, message) {
    const errId = getErrorIdFor(input);

    // Si ya existe, actualiza su texto (sin alertas)
    const existing = document.getElementById(errId);
    if (existing) {
      clearChildren(existing);
      existing.appendChild(document.createTextNode(message));
      input.classList.add("is-invalid");
      return;
    }

    // 1) Element
    const p = document.createElement("p");
    p.className = "field-error";
    p.id = errId;
    p.setAttribute("role", "alert");

    // 2) Text
    const textNode = document.createTextNode(message);

    // 3) Text como hijo del Element
    p.appendChild(textNode);

    // 4) Element al DOM: lo insertamos debajo del campo dentro de su .field
    const field = input.closest(".field");
    if (field) {
      field.appendChild(p);
    } else {
      input.parentNode.appendChild(p);
    }

    input.classList.add("is-invalid");

    // Accesibilidad: asociar el error al input
    const describedBy = input.getAttribute("aria-describedby");
    if (describedBy) {
      if (!describedBy.split(" ").includes(errId)) {
        input.setAttribute("aria-describedby", `${describedBy} ${errId}`);
      }
    } else {
      input.setAttribute("aria-describedby", errId);
    }
  }

  function normalizeEmail(value) {
    return String(value || "").trim();
  }

  function validateEmail() {
    const value = normalizeEmail(emailInput.value);

    removeFieldError(emailInput);

    if (value.length === 0) {
      addFieldError(emailInput, "El correo electrónico es obligatorio.");
      return false;
    }

    if (value.length > EMAIL_MAX) {
      addFieldError(emailInput, `El correo no puede superar ${EMAIL_MAX} caracteres.`);
      return false;
    }

    // Validación razonable adicional (además de type="email")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(value)) {
      addFieldError(emailInput, "Introduce un correo válido (ej.: nombre@dominio.com).");
      return false;
    }

    return true;
  }

  function validatePassword() {
    const value = String(passInput.value || "");

    removeFieldError(passInput);

    if (value.length === 0) {
      addFieldError(passInput, "La contraseña es obligatoria.");
      return false;
    }

    if (value.includes(" ")) {
      addFieldError(passInput, "La contraseña no puede contener espacios.");
      return false;
    }

    if (value.length < PASS_MIN) {
      addFieldError(passInput, `La contraseña debe tener al menos ${PASS_MIN} caracteres.`);
      return false;
    }

    if (value.length > PASS_MAX) {
      addFieldError(passInput, `La contraseña no puede superar ${PASS_MAX} caracteres.`);
      return false;
    }

    return true;
  }

  function validateForm() {
    const okEmail = validateEmail();
    const okPass = validatePassword();
    return okEmail && okPass;
  }

  function saveFakeSession(email) {
    // Simulación de sesión (persistencia local)
    const session = {
      email,
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem("session_demo", JSON.stringify(session));
      return true;
    } catch (e) {
      return false;
    }
  }

  function onTogglePassword() {
    const isHidden = passInput.type === "password";
    passInput.type = isHidden ? "text" : "password";

    toggleBtn.setAttribute("aria-pressed", String(isHidden));
    toggleBtn.textContent = isHidden ? "🙈" : "👁";
  }

  function onSubmit(ev) {
    ev.preventDefault();
    clearChildren(formMessages);

    const ok = validateForm();
    if (!ok) {
      setFormMessage("Revisa los campos marcados en rojo.", "error");
      return;
    }

    const email = normalizeEmail(emailInput.value);
    const stored = saveFakeSession(email);

    if (!stored) {
      setFormMessage("No se pudo guardar la sesión local (almacenamiento no disponible).", "error");
      return;
    }

    setFormMessage("Inicio de sesión correcto (sesión simulada guardada en el navegador).", "ok");

    // Buenas prácticas: limpiar contraseña tras “login”
    passInput.value = "";
    passInput.focus();
  }

  // Eventos (sin onclick en HTML)
  toggleBtn.addEventListener("click", onTogglePassword);

  form.addEventListener("submit", onSubmit);

  // Validación en tiempo real / al salir del campo
  emailInput.addEventListener("blur", validateEmail);
  passInput.addEventListener("blur", validatePassword);

  emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("is-invalid")) validateEmail();
  });

  passInput.addEventListener("input", () => {
    if (passInput.classList.contains("is-invalid")) validatePassword();
  });
})();