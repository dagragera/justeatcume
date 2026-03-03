"use strict";

(function () {
  /* -------------------- Datos simulados -------------------- */
  var ADDRESSES = [
    { label: "Plaza de España, 20, 06800 Mérida, España", city: "Mérida" },
    { label: "Avenida Reina Sofía, 12, 06800 Mérida, España", city: "Mérida" },
    { label: "Calle Santa Eulalia, 5, 06800 Mérida, España", city: "Mérida" },
    { label: "Avenida de la Universidad, s/n, 10071 Cáceres, España", city: "Cáceres" },
    { label: "Calle Pintores, 18, 10003 Cáceres, España", city: "Cáceres" },
    { label: "Plaza Mayor, 1, 10003 Cáceres, España", city: "Cáceres" },
    { label: "Calle Mayor, 45, 06002 Badajoz, España", city: "Badajoz" },
    { label: "Avenida de Europa, 7, 06004 Badajoz, España", city: "Badajoz" },
    { label: "Plaza Alta, 3, 06001 Badajoz, España", city: "Badajoz" }
  ];

  var RESTAURANTS = [
    {
      id: "mer-01",
      name: "Mesón El Pestorejo Plaza de España",
      address: "Plaza de España, 20, 06800 Mérida, España",
      phone: "924311151",
      email: "contacto@mesonelpestorejo.com",
      city: "Mérida",
      cats: ["Tradicional", "Carnes"],
      bike: "No",
      priceMin: 10,
      priceMax: 20
    },
    {
      id: "mer-02",
      name: "Tapas del Foro",
      address: "Calle Santa Eulalia, 5, 06800 Mérida, España",
      phone: "924000111",
      email: "hola@tapasdelforo.es",
      city: "Mérida",
      cats: ["Tapas"],
      bike: "Si",
      priceMin: 8,
      priceMax: 18
    },
    {
      id: "cac-01",
      name: "La Plaza de Cáceres",
      address: "Plaza Mayor, 1, 10003 Cáceres, España",
      phone: "927111222",
      email: "info@laplazadecaceres.es",
      city: "Cáceres",
      cats: ["Tradicional", "Tapas"],
      bike: "No",
      priceMin: 12,
      priceMax: 25
    },
    {
      id: "bad-01",
      name: "Taco Norte",
      address: "Plaza Alta, 3, 06001 Badajoz, España",
      phone: "924222333",
      email: "contacto@taconorte.es",
      city: "Badajoz",
      cats: ["Mexicana"],
      bike: "Si",
      priceMin: 9,
      priceMax: 19
    }
  ];

  /* -------------------- Helpers DOM -------------------- */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function clearChildren(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function setTextNode(node, text) {
    if (!node) return;
    clearChildren(node);
    node.appendChild(document.createTextNode(text));
  }

  function setMsg(el, text, ok) {
    if (!el) return;
    el.classList.remove("msg--ok", "msg--err");
    el.classList.add(ok ? "msg--ok" : "msg--err");
    setTextNode(el, text);
  }

  function clearMsg(el) {
    if (!el) return;
    el.classList.remove("msg--ok", "msg--err");
    setTextNode(el, "");
  }

  function ensureErrorEl(input) {
    var next = input.nextElementSibling;
    if (next && next.classList.contains("field__error")) return next;

    // Crear nodo <p class="field__error"> con TextNode (como en apuntes)
    var p = document.createElement("p");
    p.className = "field__error";
    p.setAttribute("role", "alert");
    p.hidden = true;

    input.insertAdjacentElement("afterend", p);

    if (input.id) {
      var id = "err_" + input.id;
      p.id = id;

      var prev = (input.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter(Boolean);

      if (prev.indexOf(id) === -1) {
        prev.push(id);
        input.setAttribute("aria-describedby", prev.join(" "));
      }
    }

    return p;
  }

  function showError(input, message) {
    var err = ensureErrorEl(input);
    clearChildren(err);
    err.appendChild(document.createTextNode(message));
    err.hidden = false;
    input.setAttribute("aria-invalid", "true");
  }

  function clearError(input) {
    var next = input.nextElementSibling;
    if (next && next.classList.contains("field__error")) {
      next.hidden = true;
      clearChildren(next);
    }
    input.removeAttribute("aria-invalid");
  }

  /* -------------------- Autocomplete reutilizable -------------------- */
  function attachAutocomplete(acRoot, items) {
    var input = $("input", acRoot);
    var list = $(".ac__list", acRoot);

    var current = [];
    var active = -1;

    function closeList() {
      clearChildren(list);
      list.hidden = true;
      active = -1;
      current = [];
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
    }

    function openList() {
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    function setActive(i) {
      active = i;
      var opts = list.querySelectorAll(".ac__item");
      var idx = 0;
      while (idx < opts.length) {
        opts[idx].setAttribute("aria-selected", idx === active ? "true" : "false");
        idx++;
      }
      if (opts[active]) input.setAttribute("aria-activedescendant", opts[active].id);
    }

    function selectIndex(i) {
      var it = current[i];
      if (!it) return;
      input.value = it.label;
      closeList();
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function render(matches) {
      clearChildren(list);

      var i = 0;
      while (i < matches.length) {
        (function (pos) {
          var it = matches[pos];
          var li = document.createElement("li");
          li.className = "ac__item";
          li.setAttribute("role", "option");
          li.id = input.id + "_opt_" + pos;
          li.setAttribute("aria-selected", pos === active ? "true" : "false");
          li.appendChild(document.createTextNode(it.label));

          li.addEventListener("mousedown", function (e) {
            e.preventDefault();
            selectIndex(pos);
          });

          list.appendChild(li);
        })(i);
        i++;
      }

      // ✅ FIX JSHint W030: nada de ternarios como sentencia
      if (matches.length > 0) openList();
      else closeList();
    }

    function search(q) {
      var query = String(q || "").trim().toLowerCase();
      if (query.length < 2) return [];
      var res = [];
      var i = 0;
      while (i < items.length && res.length < 6) {
        if (items[i].label.toLowerCase().indexOf(query) !== -1) res.push(items[i]);
        i++;
      }
      return res;
    }

    input.addEventListener("input", function () {
      current = search(input.value);
      active = -1;
      render(current);
    });

    input.addEventListener("keydown", function (e) {
      if (list.hidden) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(Math.min(active + 1, current.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(Math.max(active - 1, 0));
      } else if (e.key === "Enter") {
        if (active >= 0) {
          e.preventDefault();
          selectIndex(active);
        }
      } else if (e.key === "Escape") {
        closeList();
      }
    });

    input.addEventListener("blur", function () {
      window.setTimeout(closeList, 120);
    });
  }

  var acs = document.querySelectorAll(".ac[data-ac='address']");
  var iAc = 0;
  while (iAc < acs.length) {
    attachAutocomplete(acs[iAc], ADDRESSES);
    iAc++;
  }

  /* -------------------- Validación -------------------- */
  var PHONE_RE = /^\d{9}$/;
  var PASS_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  function validateForm(form, extraRules) {
    var controls = form.querySelectorAll("input, select, textarea");
    var ok = true;

    // limpiar errores
    var i = 0;
    while (i < controls.length) {
      if (!controls[i].disabled) clearError(controls[i]);
      i++;
    }

    if (typeof extraRules === "function") extraRules(form);

    // validar y crear nodos error
    i = 0;
    while (i < controls.length) {
      var c = controls[i];
      if (c.disabled) { i++; continue; }

      if (!c.checkValidity()) {
        ok = false;

        if (c.validity.valueMissing) showError(c, "Este campo es obligatorio.");
        else if (c.validity.typeMismatch) showError(c, "Formato inválido.");
        else if (c.validity.tooShort) showError(c, "Debe tener al menos " + c.minLength + " caracteres.");
        else if (c.validity.rangeUnderflow) showError(c, "El valor mínimo es " + c.min + ".");
        else showError(c, "Valor inválido.");
      }

      i++;
    }

    return ok;
  }

  function attachLiveValidation(form, extraRules, onValid) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = validateForm(form, extraRules);
      if (ok && typeof onValid === "function") onValid();
    });

    form.addEventListener("blur", function (e) {
      var t = e.target;
      if (!t || !t.checkValidity) return;
      validateForm(form, extraRules);
    }, true);
  }

  /* -------------------- Editar restaurante -------------------- */
  var editForm = $("#editForm");
  var editMsg = $("#editMsg");

  // Precarga demo
  $("#r_name").value = RESTAURANTS[0].name;
  $("#r_address").value = RESTAURANTS[0].address;
  $("#r_phone").value = RESTAURANTS[0].phone;
  $("#r_email").value = RESTAURANTS[0].email;

  function editExtraRules(form) {
    var phone = $("#r_phone", form);
    var email = $("#r_email", form);
    var min = $("#r_price_min", form);
    var max = $("#r_price_max", form);

    // teléfono 9 dígitos
    if (phone.value.trim() && !PHONE_RE.test(phone.value.trim())) {
      phone.setCustomValidity("El teléfono debe tener 9 dígitos numéricos.");
    } else phone.setCustomValidity("");

    // email obligatorio (type=email ya valida formato)
    if (!String(email.value || "").trim()) email.setCustomValidity("Email obligatorio.");
    else email.setCustomValidity("");

    // precios no negativos y max >= min
    var nMin = Number(min.value);
    var nMax = Number(max.value);

    if (isFinite(nMin) && nMin < 0) min.setCustomValidity("No se permiten precios negativos.");
    else min.setCustomValidity("");

    if (isFinite(nMax) && nMax < 0) max.setCustomValidity("No se permiten precios negativos.");
    else max.setCustomValidity("");

    if (isFinite(nMin) && isFinite(nMax) && nMax < nMin) {
      max.setCustomValidity("El máximo debe ser mayor o igual que el mínimo.");
    }
  }

  attachLiveValidation(editForm, editExtraRules, function () {
    setMsg(editMsg, "Cambios guardados (simulado).", true);
  });

  /* -------------------- Foto: vista previa local (sin alert) -------------------- */
  var photoInput = $("#photoInput");
  var photoPreview = $("#photoPreview");
  var photoMsg = (function () {
    // crear un <p class="msg"> tras el input hidden si no existe
    var p = $("#photoMsg");
    if (p) return p;
    p = document.createElement("p");
    p.id = "photoMsg";
    p.className = "msg";
    p.setAttribute("role", "status");
    p.setAttribute("aria-live", "polite");
    photoInput.insertAdjacentElement("afterend", p);
    return p;
  })();

  $("#btnPhoto").addEventListener("click", function () {
    clearMsg(photoMsg);
    photoInput.click();
  });

  photoInput.addEventListener("change", function () {
    var file = photoInput.files && photoInput.files[0];
    if (!file) return;

    if (!file.type || file.type.indexOf("image/") !== 0) {
      setMsg(photoMsg, "Selecciona un archivo de imagen válido.", false);
      return;
    }

    var url = URL.createObjectURL(file);
    photoPreview.src = url;
    photoPreview.alt = "Vista previa: " + file.name;
    setMsg(photoMsg, "Imagen cargada: " + file.name, true);
  });

  /* -------------------- Búsqueda por dirección -------------------- */
  var searchDialog = $("#searchDialog");
  var searchForm = $("#searchForm");
  var searchMsg = $("#searchMsg");

  var listingSection = $("#listing");
  var listingList = $("#listingList");

  // index por id para delegación de eventos (evita W083)
  var restaurantById = {};
  var ir = 0;
  while (ir < RESTAURANTS.length) {
    restaurantById[RESTAURANTS[ir].id] = RESTAURANTS[ir];
    ir++;
  }

  $("#openSearch").addEventListener("click", function (e) {
    e.preventDefault();
    clearMsg(searchMsg);
    searchDialog.showModal();
  });

  $("#closeSearch").addEventListener("click", function () {
    searchDialog.close();
  });

  $("#searchCancel").addEventListener("click", function () {
    searchDialog.close();
  });

  function detectCity(addressText) {
    var i = 0;
    while (i < ADDRESSES.length) {
      if (ADDRESSES[i].label === addressText) return ADDRESSES[i].city;
      i++;
    }
    var t = String(addressText || "").toLowerCase();
    if (t.indexOf("mérida") !== -1) return "Mérida";
    if (t.indexOf("cáceres") !== -1) return "Cáceres";
    if (t.indexOf("badajoz") !== -1) return "Badajoz";
    return "";
  }

  function fillEditForm(r) {
    $("#r_name").value = r.name;
    $("#r_address").value = r.address;
    $("#r_phone").value = r.phone;
    $("#r_email").value = r.email;
    $("#r_price_min").value = String(r.priceMin);
    $("#r_price_max").value = String(r.priceMax);

    var checks = editForm.querySelectorAll("input[type='checkbox'][name='r_cats']");
    var i = 0;
    while (i < checks.length) {
      checks[i].checked = r.cats.indexOf(checks[i].value) !== -1;
      i++;
    }

    var bikeRadios = editForm.querySelectorAll("input[type='radio'][name='r_bike']");
    i = 0;
    while (i < bikeRadios.length) {
      bikeRadios[i].checked = (bikeRadios[i].value === r.bike);
      i++;
    }

    setMsg(editMsg, "Cargado: " + r.name, true);
  }

  function renderListing(rests) {
    clearChildren(listingList);

    if (!rests.length) {
      var liEmpty = document.createElement("li");
      liEmpty.className = "list__item";
      liEmpty.appendChild(document.createTextNode("No hay resultados para ese criterio."));
      listingList.appendChild(liEmpty);
      return;
    }

    var i = 0;
    while (i < rests.length) {
      var r = rests[i];

      var li = document.createElement("li");
      li.className = "list__item";

      var left = document.createElement("div");

      var title = document.createElement("strong");
      title.appendChild(document.createTextNode(r.name));

      var meta = document.createElement("p");
      meta.className = "list__meta";
      meta.appendChild(
        document.createTextNode(r.city + " · " + r.cats.join(", ") + " · " + r.priceMin + "–" + r.priceMax + " €")
      );

      left.appendChild(title);
      left.appendChild(meta);

      var btn = document.createElement("button");
      btn.className = "btn btn--ghost";
      btn.type = "button";
      btn.setAttribute("data-open-id", r.id);
      btn.appendChild(document.createTextNode("Abrir"));

      li.appendChild(left);
      li.appendChild(btn);
      listingList.appendChild(li);

      i++;
    }
  }

  // ✅ Delegación de eventos: evita funciones dentro de bucles (W083)
  listingList.addEventListener("click", function (e) {
    var target = e.target;
    if (!target || !target.getAttribute) return;

    var id = target.getAttribute("data-open-id");
    if (!id) return;

    var r = restaurantById[id];
    if (!r) return;

    fillEditForm(r);
    listingSection.hidden = true;
    location.hash = "#main";
  });

  attachLiveValidation(searchForm, function () {}, function () {
    var q = String(new FormData(searchForm).get("s_address") || "").trim();
    var city = detectCity(q);

    var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);

    var results = [];
    var i = 0;
    while (i < RESTAURANTS.length && results.length < 10) {
      var rr = RESTAURANTS[i];

      if (city && rr.city !== city) { i++; continue; }

      var hay = (rr.name + " " + rr.city + " " + rr.cats.join(" ") + " " + rr.address).toLowerCase();

      var any = false;
      var j = 0;
      while (j < tokens.length) {
        if (hay.indexOf(tokens[j]) !== -1) { any = true; break; }
        j++;
      }

      if (any) results.push(rr);
      i++;
    }

    renderListing(results);
    listingSection.hidden = false;
    setMsg(searchMsg, "Resultados: " + results.length, true);

    searchDialog.close();
    location.hash = "#listing";
  });

  /* -------------------- Registro -------------------- */
  var registerDialog = $("#registerDialog");
  var userForm = $("#userForm");
  var restForm = $("#restForm");
  var userMsg = $("#userMsg");
  var restMsg = $("#restMsg");

  $("#openRegister").addEventListener("click", function (e) {
    e.preventDefault();
    clearMsg(userMsg);
    clearMsg(restMsg);
    registerDialog.showModal();
  });

  $("#closeRegister").addEventListener("click", function () {
    registerDialog.close();
  });

  var tabBtns = registerDialog.querySelectorAll("[data-tab]");

  function setTab(tab) {
    var i = 0;
    while (i < tabBtns.length) {
      tabBtns[i].classList.toggle("tab--active", tabBtns[i].getAttribute("data-tab") === tab);
      i++;
    }
    userForm.hidden = tab !== "user";
    restForm.hidden = tab !== "rest";
  }

  i = 0;
  while (i < tabBtns.length) {
    (function (btn) {
      btn.addEventListener("click", function () {
        setTab(btn.getAttribute("data-tab"));
      });
    })(tabBtns[i]);
    i++;
  }

  function userExtraRules(form) {
    var phone = $("#u_phone", form);
    var p1 = $("#u_pass", form);
    var p2 = $("#u_pass2", form);
    var terms = $("#u_terms", form);

    if (phone.value.trim() && !PHONE_RE.test(phone.value.trim())) phone.setCustomValidity("Teléfono: 9 dígitos numéricos.");
    else phone.setCustomValidity("");

    if (p1.value && !PASS_RE.test(p1.value)) p1.setCustomValidity("Contraseña: mínimo 8, letras y números.");
    else p1.setCustomValidity("");

    if (p2.value !== p1.value) p2.setCustomValidity("Las contraseñas no coinciden.");
    else p2.setCustomValidity("");

    if (!terms.checked) terms.setCustomValidity("Debes aceptar los términos.");
    else terms.setCustomValidity("");
  }

  function restExtraRules(form) {
    var phone = $("#rr_phone", form);
    var p1 = $("#rr_pass", form);
    var p2 = $("#rr_pass2", form);

    if (phone.value.trim() && !PHONE_RE.test(phone.value.trim())) phone.setCustomValidity("Teléfono: 9 dígitos numéricos.");
    else phone.setCustomValidity("");

    if (p1.value && !PASS_RE.test(p1.value)) p1.setCustomValidity("Contraseña: mínimo 8, letras y números.");
    else p1.setCustomValidity("");

    if (p2.value !== p1.value) p2.setCustomValidity("Las contraseñas no coinciden.");
    else p2.setCustomValidity("");
  }

  attachLiveValidation(userForm, userExtraRules, function () {
    var data = Object.fromEntries(new FormData(userForm));
    setMsg(userMsg, "Usuario creado (simulado): " + String(data.u_email || ""), true);
    userForm.reset();
  });

  attachLiveValidation(restForm, restExtraRules, function () {
    var data = Object.fromEntries(new FormData(restForm));
    setMsg(restMsg, "Restaurante registrado (simulado): " + String(data.rr_name || ""), true);
    restForm.reset();
  });

  /* -------------------- Confirmación sin confirm()/alert(): dialog dinámico -------------------- */
  function showConfirm(title, message, onOk) {
    var dlg = document.createElement("dialog");
    dlg.className = "dialog";
    dlg.setAttribute("aria-labelledby", "confirmTitle");

    var head = document.createElement("div");
    head.className = "dialog__head";

    var h = document.createElement("h2");
    h.className = "h2";
    h.id = "confirmTitle";
    h.appendChild(document.createTextNode(title));

    var closeBtn = document.createElement("button");
    closeBtn.className = "iconbtn";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Cerrar");
    closeBtn.appendChild(document.createTextNode("✕"));

    head.appendChild(h);
    head.appendChild(closeBtn);

    var p = document.createElement("p");
    p.className = "help";
    p.appendChild(document.createTextNode(message));

    var actions = document.createElement("div");
    actions.className = "dialog__actions";

    var cancel = document.createElement("button");
    cancel.className = "btn btn--ghost";
    cancel.type = "button";
    cancel.appendChild(document.createTextNode("Cancelar"));

    var ok = document.createElement("button");
    ok.className = "btn btn--primary";
    ok.type = "button";
    ok.appendChild(document.createTextNode("Confirmar"));

    actions.appendChild(cancel);
    actions.appendChild(ok);

    dlg.appendChild(head);
    dlg.appendChild(p);
    dlg.appendChild(actions);

    function cleanup() {
      dlg.close();
      if (dlg.parentNode) dlg.parentNode.removeChild(dlg);
    }

    closeBtn.addEventListener("click", cleanup);
    cancel.addEventListener("click", cleanup);
    ok.addEventListener("click", function () {
      cleanup();
      if (typeof onOk === "function") onOk();
    });

    document.body.appendChild(dlg);
    dlg.showModal();
  }

  /* -------------------- Eliminar (simulado) sin confirm/alert -------------------- */
  var deleteBtn = $("#btnDelete");
  var deleteMsg = (function () {
    var p = $("#deleteMsg");
    if (p) return p;
    p = document.createElement("p");
    p.id = "deleteMsg";
    p.className = "msg";
    p.setAttribute("role", "status");
    p.setAttribute("aria-live", "polite");
    deleteBtn.insertAdjacentElement("afterend", p);
    return p;
  })();

  deleteBtn.addEventListener("click", function () {
    clearMsg(deleteMsg);

    showConfirm(
      "Eliminar restaurante",
      "¿Seguro que quieres eliminar el restaurante? (Simulado)",
      function () {
        setMsg(deleteMsg, "Restaurante eliminado (simulado).", true);
      }
    );
  });

})();