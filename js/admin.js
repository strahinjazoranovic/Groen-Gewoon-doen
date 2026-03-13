let orderModal = null;
let closeModalBtn = null;
let orderForm = null;
let currentOrderData = null;

document.addEventListener("DOMContentLoaded", () => {
  orderModal = document.getElementById("orderModal");
  closeModalBtn = orderModal.querySelector(".close-button");
  orderForm = document.getElementById("orderForm");

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

      if (!customerName || !address || !deliveryDateTime) {
        alert("Alle velden zijn verplicht!");
        return;
      }

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
        alert("Order update mislukt!");
      }
    });
  }

  // Load initial data
  displayOrdersAdmin(".orders-table");
  displayPackages();

  // Package Form Button
  const addPackageBtn = document.querySelector(
    "#packages-nieuw .packages-form button",
  );
  if (addPackageBtn) {
    addPackageBtn.addEventListener("click", async () => {
      const name = document.getElementById("package-name").value.trim();
      const price = document.getElementById("package-price").value.trim();
      const packageId = document.getElementById("package-id").value;

      if (!name || !price) {
        alert("Vul alstublieft naam en prijs in");
        return;
      }

      if (packageId) {
        await updatePackage(packageId, { name, price });
      } else {
        await createPackage({ name, price });
      }

      clearPackageForm();
      displayPackages();
    });
  }
});

function openOrderModal(orderData) {
  currentOrderData = orderData;

  document.getElementById("customerName").value = orderData.customer || "";
  document.getElementById("address").value = orderData.address || "";
  document.getElementById("deliveryDateTime").value = orderData.delivery || "";

  orderModal.style.display = "block";
}

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

if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const customerName = document.getElementById("customerName").value.trim();
    const address = document.getElementById("address").value.trim();
    const deliveryDateTime = document.getElementById("deliveryDateTime").value;

    if (!customerName || !address || !deliveryDateTime) {
      alert("Alle velden zijn verplicht!");
      return;
    }

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
      alert("Order update mislukt!"); // optional notification
    }
  });
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

// Load data when page loads
document.addEventListener("DOMContentLoaded", () => {
  displayOrdersAdmin(".orders-table");
  displayPackages();

  // Add event listener for package form
  const addPackageBtn = document.querySelector(".packages-form .btn");
  if (addPackageBtn) {
    addPackageBtn.addEventListener("click", async () => {
      const name = document.getElementById("package-name").value;
      const price = document.getElementById("package-price").value;
      const packageId = document.getElementById("package-id").value;

      if (!name || !price) {
        alert("Vul alstublieft naam en prijs in");
        return;
      }

      if (packageId) {
        // Update existing package
        await updatePackage(packageId, { name, price });
      } else {
        // Create new package
        await createPackage({ name, price });
      }

      clearPackageForm();
      displayPackages();
    });
  }
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
