const priceData = window.PRICE_DATA || {};
const menuGrid = document.querySelector("#menu-grid");
const chips = document.querySelector("#category-chips");
const searchInput = document.querySelector("#menu-search");
const menuCount = document.querySelector("#menu-count");

if (menuGrid && chips && searchInput && menuCount) {
  const categories = Object.entries(priceData);
  let activeCategory = "all";
  let searchTerm = "";

  const normalize = (value) =>
    value
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const itemMatches = (item) => {
    if (!searchTerm) {
      return true;
    }

    const haystack = normalize(
      [item.label, item.price, item.info, item.description].filter(Boolean).join(" ")
    );

    return haystack.includes(searchTerm);
  };

  const sectionMatches = ([category, groups]) => {
    if (activeCategory !== "all" && activeCategory !== category) {
      return false;
    }

    return Object.values(groups).some((items) => items.some(itemMatches));
  };

  const renderChips = () => {
    const chipButtons = [
      `<button class="chip ${activeCategory === "all" ? "is-active" : ""}" type="button" data-category="all">Все</button>`,
      ...categories.map(
        ([category]) =>
          `<button class="chip ${activeCategory === category ? "is-active" : ""}" type="button" data-category="${category}">${category}</button>`
      ),
    ];

    chips.innerHTML = chipButtons.join("");
  };

  const renderMenu = () => {
    const visibleCategories = categories.filter(sectionMatches);

    menuCount.textContent = `${visibleCategories.length} ${visibleCategories.length === 1 ? "категория" : visibleCategories.length < 5 ? "категории" : "категорий"}`;

    if (!visibleCategories.length) {
      menuGrid.innerHTML = `
        <article class="menu-section reveal is-visible">
          <div class="menu-section-head">
            <h2>Ничего не найдено</h2>
            <span class="menu-section-meta">Попробуй другой запрос</span>
          </div>
          <p class="menu-empty-copy">По текущему прайсу нет совпадений с этим поиском.</p>
        </article>
      `;
      return;
    }

    menuGrid.innerHTML = visibleCategories
      .map(([category, groups]) => {
        const subgroups = Object.entries(groups)
          .map(([subgroup, items]) => {
            const filtered = items.filter(itemMatches);

            if (!filtered.length) {
              return "";
            }

            const label = subgroup || "Основные позиции";
            const cards = filtered
              .map(
                (item) => `
                  <article class="menu-item">
                    <div class="menu-item-top">
                      <strong>${item.label}</strong>
                      <span class="menu-price">${item.price}</span>
                    </div>
                    ${item.info ? `<div class="menu-info">${item.info}</div>` : ""}
                    ${item.description ? `<p>${item.description}</p>` : ""}
                  </article>
                `
              )
              .join("");

            return `
              <div class="menu-subgroup">
                <h3>${label}</h3>
                <div class="menu-items">${cards}</div>
              </div>
            `;
          })
          .join("");

        const totalItems = Object.values(groups).reduce((sum, items) => sum + items.filter(itemMatches).length, 0);

        return `
          <section class="menu-section reveal is-visible" id="${category.replace(/\s+/g, "-").toLowerCase()}">
            <div class="menu-section-head">
              <h2>${category}</h2>
              <span class="menu-section-meta">${totalItems} позиций</span>
            </div>
            ${subgroups}
          </section>
        `;
      })
      .join("");
  };

  chips.addEventListener("click", (event) => {
    const target = event.target.closest("[data-category]");
    if (!target) {
      return;
    }

    activeCategory = target.dataset.category;
    renderChips();
    renderMenu();
  });

  searchInput.addEventListener("input", (event) => {
    searchTerm = normalize(event.target.value);
    renderMenu();
  });

  renderChips();
  renderMenu();
}
