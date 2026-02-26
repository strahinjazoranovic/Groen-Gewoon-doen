// Read rate from rates.json
async function fetchRates() {
  const response = await fetch("/data/rates/rates.json");
  if (!response.ok) throw new Error("Failed to fetch rates");
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

  // IDs must match your HTML:
  const gras = numFromInput("gras");
  const tegels = numFromInput("tegels");
  const hegging = numFromInput("hegging");

  // JSON keys must match your rates.json:
  const grasSubtotal = gras * (ratesCache.grass ?? 0);
  const tegelsSubtotal = tegels * (ratesCache.tiles ?? 0);
  const heggingSubtotal = hegging * (ratesCache.hedge ?? 0);

  const total = grasSubtotal + tegelsSubtotal + heggingSubtotal;

  document.getElementById("grassSubtotal").textContent = eur(grasSubtotal);
  document.getElementById("tilesSubtotal").textContent = eur(tegelsSubtotal);
  document.getElementById("heggingSubtotal").textContent = eur(heggingSubtotal);

  // Only if you have this element in HTML:
  const totalEl = document.getElementById("total");
  if (totalEl) totalEl.textContent = eur(total);
}

// This function currently doesn't work
async function initQuoteCalculator() {
  ratesCache = await fetchRates();

  // Listen to YOUR real input IDs:
  document.getElementById("gras").addEventListener("input", recalculateQuote);
  document.getElementById("tegels").addEventListener("input", recalculateQuote);
  document
    .getElementById("hegging")
    .addEventListener("input", recalculateQuote);

  recalculateQuote();
}

document.addEventListener("DOMContentLoaded", initQuoteCalculator);

// Place standard package order
async function placeStandardOrder() {
  const selectedPackage = document.getElementById("pakketen").value;

  let total = 0;

  if (selectedPackage === "Standard") {
    total = 39.99;
  } else if (selectedPackage === "Premium") {
    total = 49.99;
  }

  const customerName = prompt("Voer uw naam in:");
  const address = prompt("Voer uw adres in: Straat, Postcode en Stad");
  const deliveryDateTime = prompt(
    "Voer de gewenste leverdatum in (bijv. 26-02-2026):",
  );

  if (!customerName || !address || !deliveryDateTime) {
    alert("Naam, adres en leverdatum/tijd zijn verplicht");
    return;
  }

  const newStandardOrder = {
    customer: customerName,
    address: address,
    delivery: deliveryDateTime,
    pakket: selectedPackage,
    items: [
      {
        product: `Pakket: ${selectedPackage}`,
        quantity: 1,
      },
    ],
    total: total.toFixed(2),
    status: "In behandeling",
  };

  const result = await createOrder(newStandardOrder);

  if (result) {
    alert("Order placed successfully!");
    displayOrders(".orders-table");
  } else {
    alert("Failed to place order");
  }
}

// Listen for package selection changes and show offerte card if "offerte" is selected
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

// Place custom order
async function placeCustomOrder() {
  if (!ratesCache) {
    alert("Rates not loaded yet. Please wait.");
    return;
  }

  const selectedPackage = document.getElementById("pakketen").value;

  const gras = parseFloat(document.getElementById("gras").value) || 0;
  const tegels = parseFloat(document.getElementById("tegels").value) || 0;
  const hegging = parseFloat(document.getElementById("hegging").value) || 0;

  if (
    (gras === 0 && tegels === 0 && hegging === 0) ||
    gras < 0 ||
    tegels < 0 ||
    hegging < 0
  ) {
    alert("Vul alstublieft een geldig aantal in");
    return;
  }

  // Use JSON ratesCache values here
  const total =
    gras * (ratesCache.gras ?? 0) +
    tegels * (ratesCache.tegels ?? 0) +
    hegging * (ratesCache.hegging ?? 0);

  const customerName = prompt("Voer uw naam in:");
  const address = prompt("Voer uw adres in: Straat, Postcode en Stad");
  const deliveryDateTime = prompt(
    "Voer de gewenste leverdatum in (bijv. 26-02-2026):",
  );

  if (!customerName || !address || !deliveryDateTime) {
    alert("Naam, adres en leverdatum/tijd zijn verplicht");
    return;
  }

  const newCustomOrder = {
    customer: customerName,
    address: address,
    delivery: deliveryDateTime,
    pakket: selectedPackage,
    items: [
      {
        product: `Custom: ${gras}m² gras, ${tegels}m² tegels, ${hegging}m² hegging`,
        quantity: 1,
      },
    ],
    total: total.toFixed(2),
    status: "In behandeling",
  };

  const result = await createOrder(newCustomOrder);
  if (result) {
    alert("Order placed successfully!");
    document.getElementById("gras").value = "";
    document.getElementById("tegels").value = "";
    document.getElementById("hegging").value = "";
    displayOrders(".orders-table");
  } else {
    alert("Failed to place order");
  }
}

// Load orders when page loads
document.addEventListener("DOMContentLoaded", () => {
  displayOrders(".orders-table");

  // Add event listeners to order buttons
  const buttons = document.querySelectorAll("#card #button, .btn-dark");
  buttons.forEach((btn) => {
    const text = btn.textContent.trim();
    if (text === "Bestel") {
      // btn.addEventListener("click", orderStandardPackage);
    } else if (text === "Bereken Offerte") {
      btn.addEventListener("click", calculateQuote);
    }
  });
});
