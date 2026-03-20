// ===============================
// GLOBAL VARIABLES
// ===============================

let orderModal = null;
let closeModalBtn = null;
let orderForm = null;
let currentOrderData = null;

// ===============================
// DOM LOADED EVENT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // DOM references
  orderModal = document.getElementById("orderModal");
  closeModalBtn = orderModal.querySelector(".close-button");
  orderForm = document.getElementById("orderForm");

  // Initial load
  displayOrdersAdmin(".orders-table");
  displayPackages();
  loadRates();

  // ===============================
  // MODAL EVENTS
  // ===============================

  closeModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    orderModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === orderModal) orderModal.style.display = "none";
  });

  // ===============================
  // ORDER FORM SUBMIT
  // ===============================

  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const customerName = document.getElementById("customerName").value.trim();
      const deliveryDateTime =
        document.getElementById("deliveryDateTime").value;

      // ✅ NEW: get status
      const status = document.getElementById("orderStatus").value;

      if (!customerName || !deliveryDateTime) {
        showNotification("Alle velden zijn verplicht!");
        return;
      }

      const updatedOrder = {
        ...currentOrderData,
        customer: customerName,
        delivery: deliveryDateTime,
        status: status,
      };

      const result = await updateOrder(currentOrderData.id, updatedOrder);

      if (result) {
        displayOrdersAdmin(".orders-table");
        orderModal.style.display = "none";
        showNotification("Order bijgewerkt!", "success");
      } else {
        showNotification("Order update mislukt!");
      }
    });
  }

  // ===============================
  // ADD PACKAGE
  // ===============================

  const addPackageBtn = document.getElementById("addPackageBtn");

  if (addPackageBtn) {
    addPackageBtn.addEventListener("click", async () => {
      const name = document.getElementById("package-name").value.trim();
      const price = document.getElementById("package-price").value.trim();

      if (!name || !price) {
        showNotification("Vul alstublieft naam en prijs in");
        return
      }

      // ALWAYS create a new package
      const result = await createPackage({ name, price });

      if (result) {
        showNotification("Pakket opgeslagen!", "success");
        clearPackageForm();
        displayPackages();
      } else {
        showNotification("Opslaan mislukt!");
      }
    });
  }
});

// ===============================
// CREATE PACKAGE
// ===============================

async function createPackage(packageData) {
  try {
    const response = await fetch(`${API_BASE}/data/packages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });

    if (!response.ok) throw new Error("Failed");

    return await response.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ===============================
// CLEAR PACKAGE FORM
// ===============================

function clearPackageForm() {
  document.getElementById("package-name").value = "";
  document.getElementById("package-price").value = "";
  document.getElementById("package-id").value = "";
}

// ===============================
// NOTIFICATIONS
// ===============================

function showNotification(message, type = "error") {
  const notif = document.getElementById("notification");

  notif.textContent = message;
  notif.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";

  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 3500);
}

// ===============================
// ORDER MODAL
// ===============================

function openOrderModal(orderData) {
  currentOrderData = orderData;

  document.getElementById("customerName").value = orderData.customer || "";
  document.getElementById("deliveryDateTime").value = orderData.delivery || "";

  document.getElementById("orderStatus").value =
    orderData.status || "In behandeling";

  orderModal.style.display = "block";

  initCalendarPicker();
}

// ===============================
// TAB SWITCHING
// ===============================

function Tabs(evt, tabName) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  const tablinks = document.getElementsByClassName("tablinks");

  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  if (tabName === "orders") displayOrdersAdmin(".orders-table");
  if (tabName === "pakketten") displayPackages();
}

// ===============================
// OPEN ORDER FROM TABLE
// ===============================

async function updateOrderStatus(orderId) {
  const orders = await fetchOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  openOrderModal(order);
}

// ===============================
// PACKAGE EDITING
// ===============================

function editPackage(pkgId) {
  fetchPackages().then((packages) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) return;

    document.getElementById("edit-package-id").value = pkg.id;
    document.getElementById("edit-package-name").value = pkg.name;
    document.getElementById("edit-package-price").value = pkg.price;

    document.querySelector(".packages-form2").style.display = "none";

    document.getElementById("editPackageContainer").style.display = "flex";

    document
      .getElementById("editPackageContainer")
      .scrollIntoView({ behavior: "smooth" });
  });
}

// CANCEL EDIT
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("editPackageContainer").style.display = "none";
  document.querySelector(".packages-form2").style.display = "flex";
});

// Save the package when editing
const savePackageBtn = document.getElementById("savePackageBtn");
savePackageBtn?.addEventListener("click", async () => {
  const id = document.getElementById("edit-package-id").value;
  const name = document.getElementById("edit-package-name").value.trim();
  const priceInput = document.getElementById("edit-package-price").value.trim();
  const price = parseFloat(priceInput.replace(",", "."));

  if (!name || isNaN(price) || price <= 0 || price > 1000) {
    showNotification("Vul een geldige naam en prijs in");
    return;
  }

  // Prepare data to send to backend
  const updatedPackage = { name, price };

  try {
    const response = await fetch(`${API_BASE}/data/packages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPackage),
    });

    if (!response.ok) throw new Error("Failed to update");

    showNotification("Pakket succesvol bijgewerkt!", "success");
    displayPackages();

    // Hide edit form
    document.getElementById("editPackageContainer").style.display = "none";
    document.querySelector(".packages-form2").style.display = "flex";
  } catch (err) {
    console.error(err);
    showNotification("Pakket bijwerken mislukt!");
  }
});

// ===============================
// PACKAGE Creating
// ===============================

const createPackageBtn = document.getElementById("createPackageBtn");
createPackageBtn?.addEventListener("click", async () => {
  // Read and parse input values
  const nameInput = document.getElementById("package-name").value.trim();
  const priceInput = document.getElementById("package-price").value.trim();
  const price = parseFloat(priceInput.replace(",", "."));

  // Validate inputs and make sure the name can't be empty or price can't go under 0 or above 1000
  if (!nameInput || isNaN(price) || price <= 0 || price > 1000) {
    showNotification("Vul een geldige naam en prijs in");
    return;
  }
  // Prepare package data
  const packageData = {
    name: nameInput,
    price: price,
  };

  // Send POST request to backend
  const result = await createPackage(packageData);

  if (result) {
    showNotification("Pakket succesvol toegevoegd!", "success");
    document.getElementById("package-name").value = "";
    document.getElementById("package-price").value = "";
    // Refresh packages table
    displayPackages();
  } else {
    showNotification("Pakket toevoegen mislukt!");
  }
});

// ===============================
// FETCH AND UPDATE RATES
// ===============================

// Fetch rates from json
async function fetchRates() {
  try {
    const response = await fetch("/data/rates/rates.json");
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

// Update rates from api route
async function updateRates(newRates) {
  try {
    const response = await fetch(`${API_BASE}/api/rates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRates),
    });

    if (!response.ok) throw new Error("Failed to save rates");

    showNotification("Rates opgeslagen!", "success");
  } catch (err) {
    console.error(err);
    showNotification("Opslaan mislukt!");
  }
}

// ===============================
// RATE INPUT ELEMENTS
// ===============================

const rateInputs = {
  gras: document.getElementById("rate-grass"),
  tegels: document.getElementById("rate-tiles"),
  hegging: document.getElementById("rate-hegging"),
  optieBladeren: document.getElementById("rate-bladeren"),
  optieNepgras: document.getElementById("rate-nepGrass"),
};

// Format euro
function formatEuro(value) {
  if (value == null || value === "") return "";
  return `€${value.toFixed(2).replace(".", ",")}`;
}

function parsePrice(value) {
  return parseFloat(
    value.replace("€", "").replace(/\s/g, "").replace(",", "."),
  );
}

// Load rates on page
async function loadRates() {
  const rates = await fetchRates();
  if (!rates) return;

  if (rateInputs.gras) rateInputs.gras.value = formatEuro(rates.gras);
  if (rateInputs.tegels) rateInputs.tegels.value = formatEuro(rates.tegels);
  if (rateInputs.hegging) rateInputs.hegging.value = formatEuro(rates.hegging);
  if (rateInputs.optieBladeren)
    rateInputs.optieBladeren.value = formatEuro(rates.optieBladeren);
  if (rateInputs.optieNepgras)
    rateInputs.optieNepgras.value = formatEuro(rates.optieNepgras);
}

// ENSURE € SIGN WHILE TYPING
Object.values(rateInputs).forEach((input) => {
  if (!input) return;

  input.addEventListener("input", (e) => {
    let value = input.value.replace(/[^0-9,\.]/g, ""); // keep numbers, comma, dot
    input.value = value ? `€ ${value}` : "";
  });
});

// Process save button
document
  .querySelector("#tarieven .packages-form button")
  .addEventListener("click", () => {
    const newRates = {
      gras: parsePrice(rateInputs.gras.value),
      tegels: parsePrice(rateInputs.tegels.value),
      hegging: parsePrice(rateInputs.hegging.value),
      optieBladeren: parsePrice(rateInputs.optieBladeren.value),
      optieNepgras: parsePrice(rateInputs.optieNepgras.value),
    };

    // Validate all numbers
    if (Object.values(newRates).some((v) => isNaN(v) || v < 0)) {
      showNotification("Voer geldige prijzen in!");
      return;
    }

    updateRates(newRates);
  });

// Function for the calender when editing an order
function initCalendarPicker() {
  // Get DOM elements
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("calendarTitle");
  const selectedText = document.getElementById("calendarSelected");
  const clearBtn = document.getElementById("calendarClear");
  const hiddenInput = document.getElementById("deliveryDateTime");

  // Stop if essential elements are missing
  if (!grid || !title || !selectedText || !hiddenInput) return;

  // Month names
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

  // Today's date in ISO format (YYYY-MM-DD)
  const todayIso = todayIsoDate();
  const today = new Date();

  // Calendar state (controls current view + selection)
  const state = {
    year: today.getFullYear(),
    month: today.getMonth(),
    selected: hiddenInput.value || "", // previously saved date
  };

  // If a date is already selected → jump to that month/year
  if (state.selected) {
    const [y, m] = state.selected.split("-").map(Number);
    state.year = y;
    state.month = m - 1;
  }

  // Update the text below the calendar
  function updateSelectedText() {
    if (!state.selected) {
      selectedText.textContent = "Geen datum geselecteerd";
      return;
    }

    const [y, m, d] = state.selected.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);

    // Format date nicely in Dutch
    selectedText.textContent = dateObj.toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // When user clicks a date
  function selectDate(iso) {
    state.selected = iso; // update state
    hiddenInput.value = iso; // store for form submit
    updateSelectedText(); // update UI text
    render(); // re-render calendar
  }

  // Render the calendar grid
  function render() {
    // Update header title (month + year)
    title.textContent = `${monthNames[state.month]} ${state.year}`;
    grid.innerHTML = "";

    // Get first day of month and calculate offset (Monday start)
    const firstDay = new Date(state.year, state.month, 1);
    const startDay = (firstDay.getDay() + 6) % 7;

    // Total days in current month
    const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();

    // Add empty cells before first day
    for (let i = 0; i < startDay; i += 1) {
      const empty = document.createElement("div");
      empty.className = "calendar-empty";
      grid.appendChild(empty);
    }

    // Create buttons for each day
    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = toIsoDate(state.year, state.month, day);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String(day);

      // Determine weekday (0 = Sunday, 6 = Saturday)
      const weekday = new Date(state.year, state.month, day).getDay();
      const isWeekend = weekday === 0 || weekday === 6;

      // Highlight today
      if (iso === todayIso) btn.classList.add("is-today");

      // Highlight selected date
      if (iso === state.selected) btn.classList.add("is-selected");

      // Disable:
      // - past dates (before today)
      // - BUT keep selected date clickable
      // - weekends (optional business rule)
      if ((iso < todayIso && iso !== state.selected) || isWeekend) {
        btn.classList.add("is-disabled");
        btn.disabled = true;
      }

      // Click handler → select date
      btn.addEventListener("click", () => selectDate(iso));

      grid.appendChild(btn);
    }
  }

  // Month navigation (prev / next buttons)
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

  // Clear selected date
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.selected = "";
      hiddenInput.value = "";
      updateSelectedText();
      render();
    });
  }

  // Initial render
  updateSelectedText();
  render();
}

// Get today's date as YYYY-MM-DD
function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Convert year/month/day to ISO string
function toIsoDate(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${month}-${d}`;
}

// Optional: ensure native input cannot pick past dates
function ensureFutureDateLimit() {
  const dateInput = document.getElementById("deliveryDateTime");
  if (!dateInput) return;
  dateInput.min = todayIsoDate();
}
