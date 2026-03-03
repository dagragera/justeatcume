(() => {
  "use strict";

  const form = document.getElementById("registerForm");
  const nombreInput = document.getElementById("nombre");
  const apellidosInput = document.getElementById("apellidos");
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("pass");
  const pass2Input = document.getElementById("pass2");
  const formMessages = document.getElementById("formMessages");

  const NAME_MAX = 60;
  const SURNAME_MAX = 80;
  const EMAIL_MAX = 120;
  const PASS_MIN = 8;
  const PASS_MAX = 64;

  // 8+ con: minúscula, mayúscula, número y símbolo
  const STRONG_PASS = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function clearChildren(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function buildTextElement(tagName, text, className, attrs) {
    const el = document.createElement(tagName);
    if (className) el.className = className;

    if (attrs && typeof attrs === "object") {
      Object.keys(attrs).forEach((k) => el.setAttribute(k, String(attrs[k])));
    }

    el.appendChild(document.createTextNode(text));
    return el;
  }

  function setFormMessage(text, type) {
    clearChildren(formMessages);
    const klass = type === "ok" ? "msg msg--ok" : "msg msg--error";
    const msg = buildTextElement("div", text, klass, { role: "status" });
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

    const existing = document.getElementById(errId);
    if (existing) {
      clearChildren(existing);
      existing.appendChild(document.createTextNode(message));
      input.classList.add("is-invalid");
      return;
    }

    const p = document.createElement("p");
    p.className = "field-error";
    p.id = errId;
    p.setAttribute("role", "alert");
    p.appendChild(document.createTextNode(message));

    const field = input.closest(".field");
    if (field) field.appendChild(p);
    else input.parentNode.appendChild(p);

    input.classList.add("is-invalid");

    const describedBy = input.getAttribute("aria-describedby");
    if (describedBy) {
      if (!describedBy.split(" ").includes(errId)) {
        input.setAttribute("aria-describedby", `${describedBy} ${errId}`);
      }
    } else {
      input.setAttribute("aria-describedby", errId);
    }
  }

  function normText(v) {
    return String(v || "").trim();
  }

  function validateNombre() {
    const v = normText(nombreInput.value);
    removeFieldError(nombreInput);

    if (v.length === 0) {
      addFieldError(nombreInput, "El nombre es obligatorio.");
      return false;
    }
    if (v.length > NAME_MAX) {
      addFieldError(nombreInput, `El nombre no puede superar ${NAME_MAX} caracteres.`);
      return false;
    }
    return true;
  }

  function validateApellidos() {
    const v = normText(apellidosInput.value);
    removeFieldError(apellidosInput);

    if (v.length === 0) {
      addFieldError(apellidosInput, "Los apellidos son obligatorios.");
      return false;
    }
    if (v.length > SURNAME_MAX) {
      addFieldError(apellidosInput, `Los apellidos no pueden superar ${SURNAME_MAX} caracteres.`);
      return false;
    }
    return true;
  }

  function validateEmail() {
    const v = normText(emailInput.value);
    removeFieldError(emailInput);

    if (v.length === 0) {
      addFieldError(emailInput, "El correo electrónico es obligatorio.");
      return false;
    }
    if (v.length > EMAIL_MAX) {
      addFieldError(emailInput, `El correo no puede superar ${EMAIL_MAX} caracteres.`);
      return false;
    }
    if (!EMAIL_REGEX.test(v)) {
      addFieldError(emailInput, "Introduce un correo válido (ej.: nombre@dominio.com).");
      return false;
    }
    return true;
  }

  function validatePassword() {
    const v = String(passInput.value || "");
    removeFieldError(passInput);

    if (v.length === 0) {
      addFieldError(passInput, "La contraseña es obligatoria.");
      return false;
    }
    if (v.includes(" ")) {
      addFieldError(passInput, "La contraseña no puede contener espacios.");
      return false;
    }
    if (v.length < PASS_MIN) {
      addFieldError(passInput, `La contraseña debe tener al menos ${PASS_MIN} caracteres.`);
      return false;
    }
    if (v.length > PASS_MAX) {
      addFieldError(passInput, `La contraseña no puede superar ${PASS_MAX} caracteres.`);
      return false;
    }
    if (!STRONG_PASS.test(v)) {
      addFieldError(passInput, "Debe incluir mayúscula, minúscula, número y símbolo.");
      return false;
    }
    return true;
  }

  function validatePassword2() {
    const v1 = String(passInput.value || "");
    const v2 = String(pass2Input.value || "");
    removeFieldError(pass2Input);

    if (v2.length === 0) {
      addFieldError(pass2Input, "Repite la contraseña.");
      return false;
    }
    if (v1 !== v2) {
      addFieldError(pass2Input, "Las contraseñas no coinciden.");
      return false;
    }
    return true;
  }

  function validateForm() {
    const ok1 = validateNombre();
    const ok2 = validateApellidos();
    const ok3 = validateEmail();
    const ok4 = validatePassword();
    const ok5 = validatePassword2();
    return ok1 && ok2 && ok3 && ok4 && ok5;
  }

  function loadUsers() {
    try {
      const raw = localStorage.getItem("users_demo");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem("users_demo", JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  }

  function onSubmit(ev) {
    ev.preventDefault();
    clearChildren(formMessages);

    const ok = validateForm();
    if (!ok) {
      setFormMessage("Revisa los campos marcados en rojo.", "error");
      return;
    }

    const email = normText(emailInput.value).toLowerCase();
    const users = loadUsers();

    const exists = users.some((u) => (u.email || "").toLowerCase() === email);
    if (exists) {
      addFieldError(emailInput, "Ya existe una cuenta con ese correo.");
      setFormMessage("Ese correo ya está registrado.", "error");
      return;
    }

    users.push({
      nombre: normText(nombreInput.value),
      apellidos: normText(apellidosInput.value),
      email,
      createdAt: new Date().toISOString()
    });

    if (!saveUsers(users)) {
      setFormMessage("No se pudo guardar el registro (almacenamiento no disponible).", "error");
      return;
    }

    setFormMessage("Registro correcto (usuario guardado en el navegador). Ya puedes iniciar sesión.", "ok");

    // Limpieza
    form.reset();
    nombreInput.focus();

    // Opcional: mandar al login tras 800ms
    // setTimeout(() => (window.location.href = "IniSesion.html"), 800);
  }

  // Eventos (como en IniSesion.js: sin onclick)
  form.addEventListener("submit", onSubmit);

  nombreInput.addEventListener("blur", validateNombre);
  apellidosInput.addEventListener("blur", validateApellidos);
  emailInput.addEventListener("blur", validateEmail);
  passInput.addEventListener("blur", validatePassword);
  pass2Input.addEventListener("blur", validatePassword2);

  const revalidateIfInvalid = (input, fn) => {
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) fn();
    });
  };

  revalidateIfInvalid(nombreInput, validateNombre);
  revalidateIfInvalid(apellidosInput, validateApellidos);
  revalidateIfInvalid(emailInput, validateEmail);
  revalidateIfInvalid(passInput, () => {
    const ok = validatePassword();
    if (ok && pass2Input.value) validatePassword2();
  });
  revalidateIfInvalid(pass2Input, validatePassword2);
})();