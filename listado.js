(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const listEl = $("#restList");
  const titleEl = $("#resultTitle");
  const infoEl = $("#resultInfo");
  const q2 = $("#q2");
  const nameSearch = $("#nameSearch");
  const sortSel = $("#sortSel");
  const openCheck = $("#f_open");
  const catChecks = $("#catChecks");
  const catBar = $("#catBar");
  const btnClear = $("#btnClear");

  // Datos simulados
  const RESTS = [
    { id: 1, name: "The Sushi Mérida", rating: 4.6, cats: ["Japonesa", "Sushi"], time: 30, fee: 1.00, open: true, emoji: "🍣" },
    { id: 2, name: "Asador de Pollos Koki", rating: 4.5, cats: ["Pollo", "Tradicional"], time: 25, fee: 0.00, open: true, emoji: "🍗" },
    { id: 3, name: "Aguacate Mexican & Caribbean", rating: 4.4, cats: ["Mexicana", "Caribeña"], time: 40, fee: 1.49, open: false, emoji: "🌮" },
    { id: 4, name: "Pizzería Roma", rating: 4.7, cats: ["Pizza", "Italiana"], time: 28, fee: 0.99, open: true, emoji: "🍕" },
    { id: 5, name: "Burger CUMe", rating: 4.2, cats: ["Hamburguesas", "Americana"], time: 35, fee: 1.20, open: true, emoji: "🍔" },
    { id: 6, name: "Wok Express", rating: 4.1, cats: ["China", "Asiática"], time: 32, fee: 1.10, open: false, emoji: "🥡" },
    { id: 7, name: "La Huerta", rating: 4.8, cats: ["Saludable", "Vegetariana"], time: 27, fee: 0.00, open: true, emoji: "🥗" },
    { id: 8, name: "Kebab Al Andalus", rating: 4.0, cats: ["Kebab", "Turca"], time: 22, fee: 0.79, open: true, emoji: "🥙" },
    { id: 9, name: "Tapas Plaza", rating: 4.3, cats: ["Tapas", "Tradicional"], time: 29, fee: 0.00, open: false, emoji: "🍤" }
  ];

  // Parse querystring (?q=...&cat=...)
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").trim();
  const catParam = (params.get("cat") || "").trim();

  if (q) q2.value = q;

  // Categorías disponibles
  const ALL_CATS = Array.from(
    new Set(RESTS.flatMap(r => r.cats))
  ).sort((a, b) => a.localeCompare(b, "es"));

  // Estado filtros
  const state = {
    q,
    name: "",
    onlyOpen: false,
    minRating: 0,
    cats: new Set(catParam ? [decodeCat(catParam)] : []),
    quickCat: catParam ? decodeCat(catParam) : "",
    sort: "relevancia"
  };

  function decodeCat(v){
    // mapea valores de url a etiquetas reales si quieres
    // aquí hacemos un fallback simple:
    const map = {
      promo: "Promo",
      alimentacion: "Alimentación",
      americana: "Americana",
      hamburguesas: "Hamburguesas",
      pizza: "Pizza"
    };
    return map[v] || v;
  }

  function renderCatChecks(){
    catChecks.innerHTML = "";
    ALL_CATS.forEach((c) => {
      const id = `c_${c.replace(/\s+/g,"_").toLowerCase()}`;
      const label = document.createElement("label");
      label.className = "check";
      label.innerHTML = `<input type="checkbox" value="${c}" id="${id}"> ${c}`;
      const input = label.querySelector("input");
      input.checked = state.cats.has(c);
      input.addEventListener("change", () => {
        if (input.checked) state.cats.add(c);
        else state.cats.delete(c);
        // si se usan checks, anulamos quickCat visual
        state.quickCat = "";
        renderCatBar();
        render();
      });
      catChecks.appendChild(label);
    });
  }

  function renderCatBar(){
    catBar.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = `catpill ${state.quickCat === "" ? "catpill--active" : ""}`;
    allBtn.textContent = "Todas";
    allBtn.addEventListener("click", () => {
      state.quickCat = "";
      state.cats.clear();
      syncChecks();
      renderCatBar();
      render();
    });
    catBar.appendChild(allBtn);

    // algunas destacadas
    const featured = ["Americana", "Hamburguesas", "Pizza", "Japonesa", "Tapas", "Mexicana"];
    featured.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `catpill ${state.quickCat === c ? "catpill--active" : ""}`;
      b.textContent = c;
      b.addEventListener("click", () => {
        state.quickCat = c;
        state.cats.clear(); // quick filter manda
        syncChecks();
        renderCatBar();
        render();
      });
      catBar.appendChild(b);
    });
  }

  function syncChecks(){
    // sincroniza checkboxes con state.cats (cuando usamos quick pills)
    [...catChecks.querySelectorAll("input[type=checkbox]")].forEach((cb) => {
      cb.checked = state.cats.has(cb.value);
    });
  }

  function passesFilters(r){
    if (state.onlyOpen && !r.open) return false;
    if (state.minRating && r.rating < state.minRating) return false;

    const byName = state.name ? r.name.toLowerCase().includes(state.name) : true;
    if (!byName) return false;

    if (state.quickCat) {
      if (!r.cats.includes(state.quickCat)) return false;
    }
    if (state.cats.size > 0) {
      const ok = [...state.cats].some(c => r.cats.includes(c));
      if (!ok) return false;
    }

    // "q" lo mostramos como texto, no filtramos real por dirección (simulado)
    return true;
  }

  function compare(a, b){
    switch (state.sort) {
      case "rating": return b.rating - a.rating;
      case "time": return a.time - b.time;
      case "fee": return a.fee - b.fee;
      default: return 0; // relevancia (simulada)
    }
  }

  function badgeOpen(r){
    return r.open
      ? `<span class="badge badge--ok">Abierto</span>`
      : `<span class="badge badge--warn">Cerrado</span>`;
  }

  function formatCats(r){ return r.cats.slice(0,2).join(" · "); }

  function render(){
    const filtered = RESTS.filter(passesFilters).sort(compare);

    titleEl.textContent = state.q
      ? `${filtered.length} establecimientos coinciden con “${state.q}”`
      : `${filtered.length} establecimientos`;

    infoEl.textContent = "Resultados simulados. Puedes filtrar y ordenar.";

    listEl.innerHTML = "";

    filtered.forEach((r) => {
      const li = document.createElement("li");
      li.className = "card";

      li.innerHTML = `
        <div class="card__img" aria-hidden="true">${r.emoji}</div>

        <div class="card__body">
          <div class="card__top">
            <div>
              <h3 class="card__name">
                <a href="restaurante.html?id=${r.id}">${r.name}</a>
              </h3>
              <p class="card__meta">
                ⭐ ${r.rating.toFixed(1)} · ${formatCats(r)} · ${r.time}–${r.time + 10} min · Envío €${r.fee.toFixed(2)}
              </p>
            </div>
            <div class="badges">
              ${badgeOpen(r)}
            </div>
          </div>

          <div class="card__bottom">
            <span class="badge">Entrega desde €${r.fee.toFixed(2)}</span>
            <span class="badge">${r.time}–${r.time + 10} min</span>
          </div>
        </div>
      `;

      listEl.appendChild(li);
    });
  }

  // Eventos
  nameSearch.addEventListener("input", () => {
    state.name = nameSearch.value.trim().toLowerCase();
    render();
  });

  sortSel.addEventListener("change", () => {
    state.sort = sortSel.value;
    render();
  });

  openCheck.addEventListener("change", () => {
    state.onlyOpen = openCheck.checked;
    render();
  });

  document.querySelectorAll('input[name="rate"]').forEach((r) => {
    r.addEventListener("change", () => {
      state.minRating = r.value ? Number(r.value) : 0;
      render();
    });
  });

  btnClear.addEventListener("click", () => {
    state.name = "";
    state.onlyOpen = false;
    state.minRating = 0;
    state.cats.clear();
    state.quickCat = "";
    state.sort = "relevancia";

    nameSearch.value = "";
    openCheck.checked = false;
    sortSel.value = "relevancia";
    document.querySelector('input[name="rate"][value=""]').checked = true;

    syncChecks();
    renderCatBar();
    render();
  });

  // Init
  renderCatChecks();
  renderCatBar();
  render();
})();