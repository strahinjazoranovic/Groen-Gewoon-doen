// Price rates for custom quotes
let priceRates = {
  grass: 15.0,
  tiles: 25.0,
  hedge: 20.0,
};

// // Order standard package(this function does not work)
// async function orderStandardPackage() {
//   const packageSelect = document.getElementById("pakketen");
//   const selectedOption =
//     packageSelect.options[packageSelect.selectedIndex].text;

//   const customerName = prompt("Voer uw naam in:");
//   if (!customerName) return;

//   const newOrder = {
//     customer: customerName,
//     items: [{ product: selectedOption, quantity: 1 }],
//     total: "0,00",
//     status: "In behandeling",
//   };

//   const result = await createOrder(newOrder);
//   if (result) {
//     alert("Order placed successfully!");
//     displayOrders(".orders-table");
//   } else {
//     alert("Failed to place order");
//   }
// }

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

// Place custom quote order
async function placeCustomOrder() {
  const gras = parseFloat(document.getElementById("gras").value) || 0;
  const tegels = parseFloat(document.getElementById("tegels").value) || 0;
  const hegging = parseFloat(document.getElementById("hegging").value) || 0;

  if (gras === 0 && tegels === 0 && hegging === 0) {
    alert("Vul alstublieft minstens één waarde in");
    return;
  }

  const total =
    gras * priceRates.grass +
    tegels * priceRates.tiles +
    hegging * priceRates.hedge;

  const customerName = prompt("Voer uw naam in:");
  if (customerName == 0) {
    alert("Naam is verplicht");
    return;
  }

  const newOrder = {
    customer: customerName,
    items: [
      {
        product: `Custom: ${gras}m² gras, ${tegels}m² tegels, ${hegging}m² hegging`,
        quantity: 1,
      },
    ],
    total: total.toFixed(2),
    status: "In behandeling",
  };

  const result = await createOrder(newOrder);
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
