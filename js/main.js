async function fetchRates() {
  const response = await fetch("/data/rates/rates.json");
  if (!response.ok) {
    showNotification("Failed to fetch rates");
    return {};
  }
  return await response.json();
}

let ratesCache = null;

function eur(value) {
  return "€ " + value.toFixed(2);
}

function numFromInput(id) {
  const el = document.getElementById(id);
  const v = parseFloat(el?.value);
  return Number.isFinite(v) ? v : 0;
}

function recalculateQuote() {
  if (!ratesCache) return;

  const gras = numFromInput("gras");
  const tegels = numFromInput("tegels");
  const hegging = numFromInput("hegging");

  const grasSubtotal = gras * (ratesCache.gras ?? 0);
  const tegelsSubtotal = tegels * (ratesCache.tegels ?? 0);
  const heggingSubtotal = hegging * (ratesCache.hegging ?? 0);

  const total = grasSubtotal + tegelsSubtotal + heggingSubtotal;

  document.getElementById("grassSubtotal").textContent = eur(grasSubtotal);
  document.getElementById("tilesSubtotal").textContent = eur(tegelsSubtotal);
  document.getElementById("heggingSubtotal").textContent = eur(heggingSubtotal);

  const totalEl = document.getElementById("total");
  if (totalEl) totalEl.textContent = eur(total);
}

async function initQuoteCalculator() {
  ratesCache = await fetchRates();

  document.getElementById("gras").addEventListener("input", recalculateQuote);
  document.getElementById("tegels").addEventListener("input", recalculateQuote);
  document
    .getElementById("hegging")
    .addEventListener("input", recalculateQuote);

  recalculateQuote();
}

document.addEventListener("DOMContentLoaded", initQuoteCalculator);

function showNotification(message, type = "error") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 3500);
}

const orderModal = document.getElementById("orderModal");
const closeModalBtn = document.querySelector(".close-button");
const orderForm = document.getElementById("orderForm");
let currentOrderData = null;

function openOrderModal(orderData) {
  currentOrderData = orderData;
  orderModal.style.display = "block";
}

closeModalBtn.addEventListener("click", () => {
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

  if (!customerName || !address || !deliveryDateTime) {
    showNotification("Alle velden zijn verplicht!");
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
    orderForm.reset();
    displayOrders(".orders-table");

    if (orderToPlace.pakket === "Offerte") {
      document.getElementById("gras").value = "";
      document.getElementById("tegels").value = "";
      document.getElementById("hegging").value = "";
      recalculateQuote();
    }
  } else {
    showNotification("Order plaatsen mislukt!");
  }
});

async function placeStandardOrder() {
  const selectedPackage = document.getElementById("pakketen").value;

  let total = 0;
  if (selectedPackage === "Standard") total = 39.99;
  else if (selectedPackage === "Premium") total = 49.99;

  const orderData = {
    pakket: selectedPackage,
    items: [{ product: `Pakket: ${selectedPackage}`, quantity: 1 }],
    total: total.toFixed(2),
    status: "In behandeling",
  };

  openOrderModal(orderData);
}

async function placeCustomOrder() {
  if (!ratesCache) {
    showNotification("Rates not loaded yet. Please wachten.");
    return;
  }

  const gras = parseFloat(document.getElementById("gras").value) || 0;
  const tegels = parseFloat(document.getElementById("tegels").value) || 0;
  const hegging = parseFloat(document.getElementById("hegging").value) || 0;

  if (
    (gras === 0 && tegels === 0 && hegging === 0) ||
    gras < 0 ||
    tegels < 0 ||
    hegging < 0
  ) {
    showNotification("Vul alstublieft een geldig aantal in");
    return;
  }

  const total =
    gras * (ratesCache.gras ?? 0) +
    tegels * (ratesCache.tegels ?? 0) +
    hegging * (ratesCache.hegging ?? 0);

  const orderData = {
    pakket: "Offerte",
    items: [
      {
        product: `Custom: ${gras}m² gras, ${tegels}m² tegels, ${hegging}m² hegging`,
        quantity: 1,
      },
    ],
    total: total.toFixed(2),
    status: "In behandeling",
  };

  openOrderModal(orderData);
}

// -------------------- Package Selection Logic --------------------
document.getElementById("pakketen").addEventListener("change", function () {
  if (this.value === "Offerte") {
    document.getElementById("card-offerte").style.display = "block";
    document.getElementById("button-standard").style.display = "none";
    document.getElementById("button-offerte").style.display = "block";
  } else {
    document.getElementById("card-offerte").style.display = "none";
    document.getElementById("button-standard").style.display = "inline-block";
    document.getElementById("button-offerte").style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  displayOrders(".orders-table");

  const buttons = document.querySelectorAll("#card #button, .btn-dark");
  buttons.forEach((btn) => {
    const text = btn.textContent.trim();
    if (text === "Bereken Offerte") {
      btn.addEventListener("click", calculateQuote);
    }
  });
});
