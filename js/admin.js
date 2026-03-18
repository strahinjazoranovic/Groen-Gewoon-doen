// This is the admin.js file, which holds all the code for the admin page

// Give these names an value
let orderModal = null;
let closeModalBtn = null;
let orderForm = null;
let currentOrderData = null;

// Eventlistener for when the page gets loaded
document.addEventListener("DOMContentLoaded", () => {
  orderModal = document.getElementById("orderModal");
  closeModalBtn = orderModal.querySelector(".close-button");
  orderForm = document.getElementById("orderForm");

  // Load initial data
  displayOrdersAdmin(".orders-table");
  displayPackages();
  loadRates();

  //Modal Events
  closeModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    orderModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === orderModal) orderModal.style.display = "none";
  });

  // Order Form Submit
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const customerName = document.getElementById("customerName").value.trim();
      const address = document.getElementById("address").value.trim();
      const deliveryDateTime =
        document.getElementById("deliveryDateTime").value;

      // If an user wants to submit an order without name or address or delivery date time he will get an notification and get returned
      if (!customerName || !address || !deliveryDateTime) {
        showNotification("Alle velden zijn verplicht!");
        return;
      }

      // Update order
      const updatedOrder = {
        ...currentOrderData,
        customer: customerName,
        address: address,
        delivery: deliveryDateTime,
      };

      const result = await updateOrder(currentOrderData.id, updatedOrder);
      if (result) {
        displayOrdersAdmin(".orders-table");
        orderModal.style.display = "none";
      } else {
        showNotification("Order update mislukt!");
      }
    });

    displayOrdersAdmin(".orders-table");
    displayPackages();

    // Here below is the code for adding an package which currently is not in use

    // const addPackageBtn = document.querySelector(".packages-form .btn");
    // if (addPackageBtn) {
    //   addPackageBtn.addEventListener("click", async () => {
    //     const name = document.getElementById("package-name").value;
    //     const price = document.getElementById("package-price").value;
    //     const packageId = document.getElementById("package-id").value;

    //     // If an user wants to submit an package with no name or price he will get this notification and get returned
    //     if (!name || !price) {
    //       showNotification("Vul alstublieft naam en prijs in");
    //       return;
    //     }

    //     if (packageId) {
    //       // Update existing package
    //       await updatePackage(packageId, { name, price });
    //     } else {
    //       // Create new package
    //       await createPackage({ name, price });
    //     }

    //     clearPackageForm();
    //     displayPackages();
    //   });
    // }
  }
});

// Show an notification when stuff happens correctly or fails
function showNotification(message, type = "error") {
  const notif = document.getElementById("notification");
  notif.textContent = message;
  notif.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
  notif.classList.add("show");
  setTimeout(() => notif.classList.remove("show"), 3500);
}

// Function to open moda; with order data
function openOrderModal(orderData) {
  currentOrderData = orderData;

  document.getElementById("customerName").value = orderData.customer || "";
  document.getElementById("address").value = orderData.address || "";
  document.getElementById("deliveryDateTime").value = orderData.delivery || "";

  orderModal.style.display = "block";
}

// Function for tab switching
function Tabs(evt, cityName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";

  // Load data when tabs are opened
  if (cityName === "orders") {
    displayOrdersAdmin(".orders-table");
  } else if (cityName === "pakketten") {
    displayPackages();
  }
}

// Update order status
async function updateOrderStatus(orderId) {
  const orders = await fetchOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  openOrderModal(order);
}

// Show edit form for a package
function editPackage(pkgId) {
  fetchPackages().then((packages) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) return;

    // Fill form
    document.getElementById("edit-package-id").value = pkg.id;
    document.getElementById("edit-package-name").value = pkg.name;
    document.getElementById("edit-package-price").value = pkg.price;

    // Show edit container
    document.getElementById("editPackageContainer").style.display = "flex";
    // Scroll to edit container
    document
      .getElementById("editPackageContainer")
      .scrollIntoView({ behavior: "smooth" });
  });
}

// Save edited package
document
  .getElementById("savePackageBtn")
  .addEventListener("click", async () => {
    const pkgId = document.getElementById("edit-package-id").value;
    const name = document.getElementById("edit-package-name").value;
    const price = document.getElementById("edit-package-price").value;

    await updatePackage(pkgId, { name, price });
    document.getElementById("editPackageContainer").style.display = "none";
    displayPackages(); // Refresh list
  });

// Cancel editing
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("editPackageContainer").style.display = "none";
});

function PackageTabs(evt, tabName) {
  var i, subtabcontent, subtablinks;

  subtabcontent = document.getElementsByClassName("packages-subtabcontent");
  for (i = 0; i < subtabcontent.length; i++) {
    subtabcontent[i].style.display = "none";
  }

  subtablinks = document.getElementsByClassName("packages-subtablinks");
  for (i = 0; i < subtablinks.length; i++) {
    subtablinks[i].className = subtablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Fetch rates from JSON
async function fetchRates() {
  try {
    const response = await fetch("/data/rates/rates.json");
    if (!response.ok) {
      showNotification("Failed to fetch rates");
      return {};
    }
    return await response.json();
  } catch (err) {
    console.error(err);
    showNotification("Failed to fetch rates");
    return {};
  }
}

// Load the inputs for rates
const rateInputs = {
  gras: document.getElementById("rate-grass"),
  tegels: document.getElementById("rate-tiles"),
  hegging: document.getElementById("rate-hegging"),
  optieBladeren: document.getElementById("rate-bladeren"),
  optieNepgras: document.getElementById("rate-nepGrass"),
};

// Load rates from JSON and populate input fields
async function loadRates() {
  const rates = await fetchRates();
  if (!rates) return;

  if (rateInputs.gras) rateInputs.gras.value = rates.gras ?? "";
  if (rateInputs.tegels) rateInputs.tegels.value = rates.tegels ?? "";
  if (rateInputs.hegging) rateInputs.hegging.value = rates.hegging ?? "";
  if (rateInputs.optieBladeren)
    rateInputs.optieBladeren.value = rates.optieBladeren ?? "";
  if (rateInputs.optieNepgras)
    rateInputs.optieNepgras.value = rates.optieNepgras ?? "";
}

// Update rates JSON
async function updateRates(newRates) {
  try {
    const response = await fetch("http://localhost:3000/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRates),
    });

    if (!response.ok) throw new Error("Failed to save rates");

    showNotification("Rates updated successfully!", "success");
  } catch (err) {
    console.error(err);
    showNotification("Failed to update rates");
  }
}

// Handle the save button click for rates
document
  .querySelector("#tarieven .packages-form button")
  .addEventListener("click", () => {
    const newGras = parseFloat(rateInputs.gras.value.replace(",", "."));
    const newTegels = parseFloat(rateInputs.tegels.value.replace(",", "."));
    const newHegging = parseFloat(rateInputs.hegging.value.replace(",", "."));
    const newOptieBladeren = parseFloat(
      rateInputs.optieBladeren.value.replace(",", "."),
    );
    const newOptieNepGras = parseFloat(
      rateInputs.optieNepgras.value.replace(".", "."),
    );

    // If one of these values is not an number show an notification and return the user
    if (
      isNaN(newGras) ||
      newGras < 0 ||
      isNaN(newTegels) ||
      newTegels < 0 ||
      isNaN(newHegging) ||
      newHegging < 0 ||
      isNaN(newOptieBladeren) ||
      newOptieBladeren < 0 ||
      isNaN(newOptieNepGras) ||
      newOptieNepGras < 0
    ) {
      showNotification("Voer geldige prijzen in!");
      return;
    }

    const newRates = {
      gras: newGras,
      tegels: newTegels,
      hegging: newHegging,
      optieBladeren: newOptieBladeren,
      optieNepgras: newOptieNepGras,
    };

    updateRates(newRates);
  });
