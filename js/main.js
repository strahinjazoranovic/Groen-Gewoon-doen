// Price rates for custom quotes
let priceRates = {
  grass: 15.0,
  tiles: 25.0,
  hedge: 20.0,
};

// Calculate custom quote
function calculateQuote() {
  const gras = parseFloat(document.getElementById("gras").value) || 0;
  const tegels = parseFloat(document.getElementById("tegels").value) || 0;
  const hegging = parseFloat(document.getElementById("hegging").value) || 0;

  const total =
    gras * priceRates.grass +
    tegels * priceRates.tiles +
    hegging * priceRates.hedge;

  alert(
    `Offerte: €${total.toFixed(2)}\n\n${gras}m² gras: €${(gras * priceRates.grass).toFixed(2)}\n${tegels}m² tegels: €${(tegels * priceRates.tiles).toFixed(2)}\n${hegging}m² hegging: €${(hegging * priceRates.hedge).toFixed(2)}`,
  );

  return total;
}

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

  const total =
    gras * priceRates.grass +
    tegels * priceRates.tiles +
    hegging * priceRates.hedge;

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
