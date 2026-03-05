(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);

  // Datos simples (incluye Cafetería CUMe, que puntúa)
  const DB = [
    {
      id: 1,
      name: "Mesón El Postrejo Plaza de España",
      address: "Plaza de España 20, 06800 Mérida, España",
      phone: "924341151",
      email: "contacto@mesonpostrejo.com",
      priceMin: 10,
      priceMax: 20,
      cats: ["Tradicional", "Tapas", "Carnes"],
      rating: 4.7,
      bike: "No",
      heroStyle: "linear-gradient(120deg,#fcd34d,#fb923c,#f97316)",
      menu: {
        destacados: [
          { name: "Postrejo con patatas", desc: "Plato combinado clásico.", price: 11.00 },
          { name: "Bacalao dorado", desc: "Bacalao con patata y huevo.", price: 13.50 },
          { name: "Secreto ibérico", desc: "Con patatas y pimientos.", price: 14.00 },
          { name: "Pinchín al mesón", desc: "Carne adobada y salsa.", price: 3.30 }
        ],
        raciones: [
          { name: "Croquetas caseras", desc: "Ración (8 uds).", price: 8.50 },
          { name: "Calamares", desc: "Calamares fritos.", price: 10.50 }
        ],
        bocadillos: [
          { name: "Bocadillo de lomo", desc: "Lomo, queso y pimiento.", price: 5.50 },
          { name: "Montadito ibérico", desc: "Jamón ibérico.", price: 3.20 }
        ],
        bebidas: [
          { name: "Agua", desc: "Botella 50cl.", price: 1.20 },
          { name: "Refresco", desc: "Lata 33cl.", price: 2.00 }
        ],
        postres: [
          { name: "Tarta casera", desc: "Porción del día.", price: 4.00 }
        ]
      }
    },
    {
      id: 2,
      name: "Cafetería CUMe",
      address: "Centro Universitario de Mérida (CUMe), 06800 Mérida",
      phone: "924000000",
      email: "cafeteria@cume.unex.es",
      priceMin: 3,
      priceMax: 12,
      cats: ["Cafetería", "Bocadillos", "Desayunos"],
      rating: 4.4,
      bike: "Si",
      heroStyle: "linear-gradient(120deg,#fde68a,#a7f3d0,#fb923c)",
      menu: {
        destacados: [
          { name: "Bocadillo de pollo", desc: "Pollo, lechuga y salsa suave.", price: 4.50 },
          { name: "Tostada tomate", desc: "Con AOVE y sal.", price: 2.20 },
          { name: "Café con leche", desc: "Café recién hecho.", price: 1.40 },
          { name: "Tortilla (pincho)", desc: "Pincho de tortilla casera.", price: 2.60 }
        ],
        raciones: [
          { name: "Patatas bravas", desc: "Ración para compartir.", price: 3.50 }
        ],
        bocadillos: [
          { name: "Bocadillo de jamón", desc: "Jamón y queso.", price: 4.20 }
        ],
        bebidas: [
          { name: "Zumo naranja", desc: "Natural.", price: 2.20 }
        ],
        postres: [
          { name: "Yogur", desc: "Yogur natural.", price: 1.60 }
        ]
      }
    }
  ];

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id") || "1");
  const r = DB.find(x => x.id === id) || DB[0];

  // HERO
  const hero = $("#heroImg");
  hero.style.background = r.heroStyle;

  // Header info
  $("#rTitle").textContent = r.name;
  $("#rRatingTxt").textContent = r.rating.toFixed(1);
  $("#rCatsTxt").textContent = r.cats.join(" · ");
  $("#rAddressInline").textContent = r.address;

  const phoneLink = $("#rPhoneLink");
  phoneLink.textContent = r.phone;
  phoneLink.href = `tel:${r.phone}`;

  const emailLink = $("#rEmailLink");
  emailLink.textContent = r.email;
  emailLink.href = `mailto:${r.email}`;

  // Stars (simple)
  const starsCount = Math.max(0, Math.min(5, Math.round(r.rating)));
  $("#rStars").textContent = "★★★★★".slice(0, starsCount) + "☆☆☆☆☆".slice(0, 5 - starsCount);

  // Chips
  const chips = $("#rChips");
  chips.innerHTML = "";
  r.cats.forEach(c => {
    const s = document.createElement("span");
    s.className = "chip";
    s.textContent = c;
    chips.appendChild(s);
  });

  // Ficha campos (readonly/disabled)
  $("#f_name").value = r.name;
  $("#f_tel").value = r.phone;
  $("#f_addr").value = r.address;
  $("#f_email").value = r.email;
  $("#f_min").value = String(r.priceMin);
  $("#f_max").value = String(r.priceMax);

  // categorías checkboxes disabled
  const allCats = Array.from(new Set(DB.flatMap(x => x.cats))).sort((a,b)=>a.localeCompare(b,"es"));
  const catsBox = $("#f_cats");
  catsBox.innerHTML = "";
  allCats.forEach((c) => {
    const lab = document.createElement("label");
    lab.className = "check";
    lab.innerHTML = `<input type="checkbox" name="cats" value="${c}" disabled> ${c}`;
    const cb = lab.querySelector("input");
    cb.checked = r.cats.includes(c);
    catsBox.appendChild(lab);
  });

  // rating select disabled
  const ratingSel = $("#f_rating");
  ratingSel.value = String(Math.round(r.rating));

  // bike radios disabled
  document.querySelectorAll('input[name="bike"]').forEach((rb) => {
    rb.checked = rb.value === r.bike;
  });

  // Carta
  const tabButtons = document.querySelectorAll(".tab");
  const menuTitle = $("#menuTitle");
  const menuCount = $("#menuCount");
  const menuRow = $("#menuRow");
  const menuQuery = $("#menuQuery");

  let currentTab = "destacados";

  function getMenuItems() {
    const items = r.menu[currentTab] || [];
    const q = menuQuery.value.trim().toLowerCase();
    if (!q) return items;
    return items.filter(p =>
      p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
    }

  function renderMenu() {
    const items = getMenuItems();
    menuTitle.textContent = tabLabel(currentTab);
    menuCount.textContent = `${items.length} platos`;

    menuRow.innerHTML = "";
    items.forEach((p) => {
      const li = document.createElement("li");
      li.className = "menuCard";
      li.innerHTML = `
        <div class="menuImg" aria-hidden="true"></div>
        <h3 class="menuName">${p.name}</h3>
        <p class="menuDesc">${p.desc}</p>
        <div class="menuFoot">
          <span class="price">${p.price.toFixed(2)} €</span>
          <button class="addBtn" type="button">Añadir</button>
        </div>
      `;
      menuRow.appendChild(li);
    });
  }

  function tabLabel(key){
    const map = {
      destacados: "Destacados",
      raciones: "Raciones",
      bocadillos: "Bocadillos y Montaditos",
      bebidas: "Bebidas",
      postres: "Postres"
    };
    return map[key] || key;
  }

  tabButtons.forEach((b) => {
    b.addEventListener("click", () => {
      tabButtons.forEach(x => x.classList.remove("tab--active"));
      b.classList.add("tab--active");
      currentTab = b.getAttribute("data-tab");
      renderMenu();
    });
  });

  menuQuery.addEventListener("input", renderMenu);

  // Init
  renderMenu();
})();