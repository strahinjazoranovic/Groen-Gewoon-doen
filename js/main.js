// This is the functions.js file, which holds all the code for the index.html page

// Give these names an value
let ratesCache = null;
let packagesCache = null;

// Define max values for gras, tegels and hegging
const MAX_GRAS = 500;
const MAX_TEGELS = 300;
const MAX_HEGGING = 100;

// Eventlistener for when the page gets loaded
document.addEventListener("DOMContentLoaded", async () => {
  packagesCache = await fetchPackages();
  populatePackagesDropdown();

  displayOrders(".orders-table");
  ensureFutureDateLimit();
  initCalendarPicker();
  initQuoteCalculator();
  updatePackagePrice();

  const pakketenSelect = document.getElementById("pakketen");
  pakketenSelect?.addEventListener("change", () => {
    updatePackagePrice();

    if (pakketenSelect.value === "Offerte") {
      document.getElementById("card-offerte").style.display = "block";
      document.getElementById("button-standard").style.display = "none";
      document.getElementById("button-offerte").style.display = "block";
    } else {
      document.getElementById("card-offerte").style.display = "none";
      document.getElementById("button-standard").style.display = "inline-block";
      document.getElementById("button-offerte").style.display = "none";
    }
  });

  const standardBtn = document.getElementById("button-standard");
  const customBtn = document.getElementById("button-offerte");

  standardBtn?.addEventListener("click", placeStandardOrder);
  customBtn?.addEventListener("click", placeCustomOrder);
});

// Fetch rates from an json
async function fetchRates() {
  const response = await fetch("/data/rates/rates.json");
  if (!response.ok) {
    showNotification("Failed to fetch rates");
    return {};
  }
  return await response.json();
}

// Fetch packages
async function fetchPackages() {
  const response = await fetch("/data/packages/packages.json");

  if (!response.ok) {
    showNotification("Failed to fetch packages");
    return [];
  }

  const data = await response.json();
  return data.packages ?? [];
}

// Get package price
function getPackagePrice(packageName) {
  if (!packagesCache) return 0;

  const pkg = packagesCache.find((p) => p.name === packageName);
  if (!pkg) return 0;

  return parseFloat(pkg.price.replace(",", "."));
}

// Populate packages dropdown dynamically
function populatePackagesDropdown() {
  const select = document.getElementById("pakketen");
  if (!select || !packagesCache) return;

  select.innerHTML = "";

  packagesCache.forEach((pkg) => {
    const option = document.createElement("option");
    option.value = pkg.name;
    option.textContent = pkg.name;
    select.appendChild(option);
  });

  const customOption = document.createElement("option");
  customOption.value = "Offerte";
  customOption.textContent = "Custom offerte";
  select.appendChild(customOption);
}

// Delete order as user
async function deleteOrderUser(orderId) {
  orderToDelete = orderId;
  const modal = document.getElementById("deleteModal");
  modal.style.display = "block";
}

// Ja button, which has an ? to ensure the js doesn't crash if the html doesn't have confirmDelete on the page
document
  .getElementById("confirmDelete")
  ?.addEventListener("click", async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete);
      displayOrders(".orders-table");
      orderToDelete = null;
    }
    document.getElementById("deleteModal").style.display = "none";
  });

// Nee button, which has an ? to ensure the js doesn't crash if the html doesn't have confirmDelete on the page
document.getElementById("cancelDelete")?.addEventListener("click", () => {
  orderToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
});

// Close modal when clicking X, which has an ? to ensure the js doesn't crash if the html doesn't have confirmDelete on the page
document.getElementById("deleteModalClose")?.addEventListener("click", () => {
  orderToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
});

function eur(value) {
  return "€ " + value.toFixed(2);
}

function readQuantity(id, max) {
  const el = document.getElementById(id);
  const raw = parseFloat(el?.value);
  let value = Number.isFinite(raw) ? raw : 0;
  let exceeded = false;

  if (value < 0) {
    value = 0;
    exceeded = true;
  }

  if (value > max) {
    value = max;
    exceeded = true;
  }

  if (el) el.value = value;

  return { value, exceeded };
}

// Function to calculate gras, tegels and hegging using /data/rates/rates.json
function recalculateQuote() {
  if (!ratesCache) return;

  const gras = readQuantity("gras", MAX_GRAS).value;
  const tegels = readQuantity("tegels", MAX_TEGELS).value;
  const hegging = readQuantity("hegging", MAX_HEGGING).value;

  const grasSubtotal = gras * (ratesCache.gras ?? 0);
  const tegelsSubtotal = tegels * (ratesCache.tegels ?? 0);
  const heggingSubtotal = hegging * (ratesCache.hegging ?? 0);

  const optiesIngeschakeld = document.getElementById("opties")?.checked;
  const bladerenGeselecteerd =
    document.getElementById("optie-bladeren")?.checked;
  const nepgrasGeselecteerd = document.getElementById("optie-nepgras")?.checked;

  const optiesSubtotaal = optiesIngeschakeld
    ? (bladerenGeselecteerd ? (ratesCache.optieBladeren ?? 0) : 0) +
      (nepgrasGeselecteerd ? (ratesCache.optieNepgras ?? 0) : 0)
    : 0;

  const total =
    grasSubtotal + tegelsSubtotal + heggingSubtotal + optiesSubtotaal;

  document.getElementById("grassSubtotal").textContent = eur(grasSubtotal);
  document.getElementById("tilesSubtotal").textContent = eur(tegelsSubtotal);
  document.getElementById("heggingSubtotal").textContent = eur(heggingSubtotal);

  const optiesSubtotaalEl = document.getElementById("optiesSubtotaal");
  if (optiesSubtotaalEl) optiesSubtotaalEl.textContent = eur(optiesSubtotaal);

  const totalEl = document.getElementById("total");
  if (totalEl) totalEl.textContent = eur(total);
}

async function initQuoteCalculator() {
  ratesCache = await fetchRates();

  ["gras", "tegels", "hegging"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", recalculateQuote);
  });

  const optiesSchakelaar = document.getElementById("opties");
  const optiesLijst = document.getElementById("opties-lijst");
  const optieBladeren = document.getElementById("optie-bladeren");
  const optieNepgras = document.getElementById("optie-nepgras");

  if (optiesSchakelaar && optiesLijst) {
    optiesSchakelaar.addEventListener("change", () => {
      const isVisible = optiesSchakelaar.checked;
      optiesLijst.classList.toggle("is-visible", isVisible);
      optiesLijst.setAttribute("aria-hidden", String(!isVisible));

      if (!isVisible) {
        if (optieBladeren) optieBladeren.checked = false;
        if (optieNepgras) optieNepgras.checked = false;
      }

      recalculateQuote();
    });
  }

  if (optieBladeren) optieBladeren.addEventListener("change", recalculateQuote);
  if (optieNepgras) optieNepgras.addEventListener("change", recalculateQuote);

  recalculateQuote();
}

// Show an notification when stuff happens correctly or fails
function showNotification(message, type = "error") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 3500);
}

// Function for the calender
function initCalendarPicker() {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("calendarTitle");
  const selectedText = document.getElementById("calendarSelected");
  const clearBtn = document.getElementById("calendarClear");
  const hiddenInput = document.getElementById("deliveryDateTime");
  if (!grid || !title || !selectedText || !hiddenInput) return;

  const monthNames = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
  ];

  const todayIso = todayIsoDate();
  const today = new Date();
  const state = {
    year: today.getFullYear(),
    month: today.getMonth(),
    selected: hiddenInput.value || "",
  };

  function updateSelectedText() {
    if (!state.selected) {
      selectedText.textContent = "Geen datum geselecteerd";
      return;
    }
    const [y, m, d] = state.selected.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    selectedText.textContent = dateObj.toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function selectDate(iso) {
    state.selected = iso;
    hiddenInput.value = iso;
    updateSelectedText();
    render();
  }

  function render() {
    title.textContent = `${monthNames[state.month]} ${state.year}`;
    grid.innerHTML = "";

    const firstDay = new Date(state.year, state.month, 1);
    const startDay = (firstDay.getDay() + 6) % 7; // Monday start
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

    for (let i = 0; i < startDay; i += 1) {
      const empty = document.createElement("div");
      empty.className = "calendar-empty";
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = toIsoDate(state.year, state.month, day);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(day);
      const weekday = new Date(state.year, state.month, day).getDay();
      const isWeekend = weekday === 0 || weekday === 6;

      if (iso === todayIso) btn.classList.add("is-today");
      if (iso === state.selected) btn.classList.add("is-selected");
      if (iso < todayIso || isWeekend) {
        btn.classList.add("is-disabled");
        btn.disabled = true;
      }

      btn.addEventListener("click", () => selectDate(iso));
      grid.appendChild(btn);
    }
  }

  document.querySelectorAll(".calendar-nav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.getAttribute("data-dir")) || 0;
      const nextMonth = state.month + dir;
      if (nextMonth < 0) {
        state.month = 11;
        state.year -= 1;
      } else if (nextMonth > 11) {
        state.month = 0;
        state.year += 1;
      } else {
        state.month = nextMonth;
      }
      render();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.selected = "";
      hiddenInput.value = "";
      updateSelectedText();
      render();
    });
  }

  updateSelectedText();
  render();
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toIsoDate(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${month}-${d}`;
}

function ensureFutureDateLimit() {
  const dateInput = document.getElementById("deliveryDateTime");
  if (!dateInput) return;
  dateInput.min = todayIsoDate();
}

const orderModal = document.getElementById("orderModal");
const closeModalBtn = document.querySelector(".close-button");
const orderForm = document.getElementById("orderForm");
let currentOrderData = null;

function openOrderModal(orderData) {
  currentOrderData = orderData;
  orderModal.style.display = "block";
}

closeModalBtn.addEventListener("click", (e) => {
  e.preventDefault();
  orderModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === orderModal) orderModal.style.display = "none";
});

orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const customerName = document.getElementById("customerName").value.trim();
  const address = document.getElementById("address").value.trim();
  const deliveryDateTime = document.getElementById("deliveryDateTime").value;
  const minDate = todayIsoDate();

  if (!customerName || !address || !deliveryDateTime) {
    showNotification("Alle velden zijn verplicht!");
    return;
  }

  if (deliveryDateTime < minDate) {
    showNotification("Leverdatum moet vandaag of later zijn");
    return;
  }

  const orderToPlace = {
    ...currentOrderData,
    customer: customerName,
    address: address,
    delivery: deliveryDateTime,
  };

  const result = await createOrder(orderToPlace);

  if (result) {
    showNotification("Order succesvol geplaatst!", "success");
    orderModal.style.display = "none";
    displayOrders(".orders-table");

    if (orderToPlace.pakket === "Offerte") {
      ["gras", "tegels", "hegging"].forEach((id) => {
        document.getElementById(id).value = "";
      });
      recalculateQuote();
    }
  } else {
    showNotification("Order plaatsen mislukt!");
  }
});

// Place standard order
async function placeStandardOrder(e) {
  e.preventDefault();

  const selectedPackage = document.getElementById("pakketen").value;
  const total = getPackagePrice(selectedPackage);

  const orderData = {
    pakket: selectedPackage,
    items: [{ product: `Pakket: ${selectedPackage}`, quantity: 1 }],
    total: parseFloat(total.toFixed(2)),
    status: "In behandeling",
  };

  openOrderModal(orderData);
}

// Place custom order
async function placeCustomOrder(e) {
  e.preventDefault();

  if (!ratesCache) {
    showNotification("Rates not loaded yet. Please wachten.");
    return;
  }

  const grasResult = readQuantity("gras", MAX_GRAS);
  const tegelsResult = readQuantity("tegels", MAX_TEGELS);
  const heggingResult = readQuantity("hegging", MAX_HEGGING);

  const gras = grasResult.value;
  const tegels = tegelsResult.value;
  const hegging = heggingResult.value;

  // Makes sure that the user can't submit an order without inputting anything, and if he does he will get an notification and get returned
  if (
    (gras === 0 && tegels === 0 && hegging === 0) ||
    gras < 0 ||
    tegels < 0 ||
    hegging < 0
  ) {
    showNotification("Vul alstublieft een geldig aantal in");
    return;
  }

  const optiesIngeschakeld = document.getElementById("opties")?.checked;
  const bladerenGeselecteerd =
    document.getElementById("optie-bladeren")?.checked;
  const nepgrasGeselecteerd = document.getElementById("optie-nepgras")?.checked;

  const optiesSubtotaal = optiesIngeschakeld
    ? (bladerenGeselecteerd ? (ratesCache.optieBladeren ?? 0) : 0) +
      (nepgrasGeselecteerd ? (ratesCache.optieNepgras ?? 0) : 0)
    : 0;

  const total =
    gras * (ratesCache.gras ?? 0) +
    tegels * (ratesCache.tegels ?? 0) +
    hegging * (ratesCache.hegging ?? 0) +
    optiesSubtotaal;

  const gekozenOpties = [];
  if (optiesIngeschakeld && bladerenGeselecteerd)
    gekozenOpties.push("Bladeren opruimen");
  if (optiesIngeschakeld && nepgrasGeselecteerd)
    gekozenOpties.push("Nepgras aanleggen");
  const optiesTekst = gekozenOpties.length
    ? ` Opties: ${gekozenOpties.join(", ")}`
    : "";

  const orderData = {
    pakket: "Offerte",
    items: [
      {
        product: `Custom: ${gras}m² gras, ${tegels}m² tegels, ${hegging}m² hegging.${optiesTekst}`,
        quantity: 1,
      },
    ],
    total: parseFloat(total.toFixed(2)),
    status: "In behandeling",
  };

  openOrderModal(orderData);
}

function updatePackagePrice() {
  const selectedPackage = document.getElementById("pakketen").value;
  const priceEl = document.getElementById("package-price");

  if (!priceEl) return;

  if (selectedPackage === "Offerte") {
    priceEl.textContent = "Op maat";
    return;
  }

  const price = getPackagePrice(selectedPackage);
  priceEl.textContent = eur(price);
}
