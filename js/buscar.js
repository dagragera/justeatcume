(() => {
  "use strict";

  const form = document.getElementById("searchForm");
  const input = document.getElementById("q");
  const msg = document.getElementById("searchMsg");
  const acRoot = document.querySelector(".ac");
  const list = acRoot.querySelector(".ac__list");

  // Datos de ejemplo (puedes cambiar a Mérida/Badajoz/CUME)
  const SUGGESTIONS = [
    "Calle Santa Eulalia 2, 06800 Mérida",
    "Plaza de España, Mérida",
    "Avenida Juan Carlos I, Mérida",
    "Campus Universitario de Mérida (CUMe)",
    "Calle John Lennon, Mérida",
    "Badajoz, Centro",
    "Cáceres, Plaza Mayor"
  ];

  function clearList() {
    list.innerHTML = "";
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  function render(items) {
    list.innerHTML = "";
    items.forEach((text, idx) => {
      const li = document.createElement("li");
      li.className = "ac__item";
      li.setAttribute("role", "option");
      li.setAttribute("id", `ac-opt-${idx}`);
      li.textContent = text;

      li.addEventListener("mousedown", (e) => {
        // mousedown para que no se cierre antes por blur
        e.preventDefault();
        input.value = text;
        msg.textContent = `Dirección seleccionada: ${text}`;
        clearList();
      });

      list.appendChild(li);
    });

    list.hidden = items.length === 0;
    input.setAttribute("aria-expanded", items.length ? "true" : "false");
  }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();

    if (q.length < 2) {
      msg.textContent = "";
      clearList();
      return;
    }

    const filtered = SUGGESTIONS
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 6);

    render(filtered);
  });

  input.addEventListener("blur", () => {
    // pequeño delay para permitir click en lista
    setTimeout(clearList, 120);
  });

  form.addEventListener("submit", (e) => {
    const v = input.value.trim();
    if (!v) {
      e.preventDefault();
      msg.textContent = "Escribe una dirección para buscar.";
      input.focus();
      return;
    }
    // Deja que navegue a listado.html?q=...
    msg.textContent = "Buscando (simulado)…";
  });
})();