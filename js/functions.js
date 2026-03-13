// API Base URL
const API_BASE = "http://localhost:3000/data"; 

// Fetch all orders
async function fetchOrders() {
  try {
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Fetch all packages
async function fetchPackages() {
  try {
    const response = await fetch(`${API_BASE}/packages`);
    if (!response.ok) throw new Error("Failed to fetch packages");
    return await response.json();
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

// Display orders in user table
async function displayOrders(tableSelector) {
  const orders = await fetchOrders();
  const tbody = document.querySelector(`${tableSelector} tbody`);

  if (!tbody) return;

  tbody.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.address}</td>
      <td>${order.delivery}</td>
      <td>€${order.total}</td>
      <td>${order.status}</td>
      <td>
        <button class="btn btn-danger" onclick="deleteOrderUser(${order.id})">Annuleer</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Display orders in admin table
async function displayOrdersAdmin(tableSelector) {
  const orders = await fetchOrders();
  const tbody = document.querySelector(`${tableSelector} tbody`);

  if (!tbody) return;

  tbody.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.pakket}</td>
      <td>${order.address}</td>
      <td>${order.delivery}</td>
      <td>€${order.total}</td>
      <td>${order.status}</td>
      <td>
        <button class="btn btn-green" onclick="updateOrderStatus(${order.id})">Update</button>
        <button class="btn btn-danger" onclick="deleteOrderAdmin(${order.id})">Verwijder</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Display packages
async function displayPackages() {
  const packages = await fetchPackages();
  const packagesDiv = document.querySelector(".packages-table");

  if (!packagesDiv) return;

  const header = packagesDiv.querySelector(".packages-head");
  const headerClone = header ? header.cloneNode(true) : null;

  packagesDiv.innerHTML = "";

  if (headerClone) packagesDiv.appendChild(headerClone);

  packages.forEach((pkg) => {
    const row = document.createElement("div");
    row.className = "packages-row";
    row.innerHTML = `
      <div>${pkg.name}</div>
      <div>€ ${pkg.price || 0}</div>
      <div><button class="btn btn-muted" onclick="editPackage(${pkg.id})">Bewerk</button></div>
      <div><button class="btn btn-danger" onclick="deletePackageModal(${pkg.id})">Verwijder</button></div>
    `;
    packagesDiv.appendChild(row);
  });
}

// CREATE order
async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error("Failed to create order");

    return await response.json();
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

// UPDATE order
async function updateOrder(orderId, orderData) {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error("Failed to update order");

    return await response.json();
  } catch (error) {
    console.error("Error updating order:", error);
  }
}

// DELETE order
async function deleteOrder(orderId) {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to delete order");

    return await response.json();
  } catch (error) {
    console.error("Error deleting order:", error);
  }
}

// Open order delete modal
function deleteOrderAdmin(orderId) {
  orderToDelete = orderId;
  document.getElementById("deleteModal").style.display = "block";
}

// Confirm order delete
document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (orderToDelete) {
    await deleteOrder(orderToDelete);
    displayOrders(".orders-table");
    orderToDelete = null;
  }
  document.getElementById("deleteModal").style.display = "none";
});

// Cancel order delete
document.getElementById("cancelDelete").addEventListener("click", () => {
  orderToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
});

// Close order modal
document.getElementById("deleteModalClose").addEventListener("click", () => {
  orderToDelete = null;
  document.getElementById("deleteModal").style.display = "none";
});

// Packages
let orderToDelete = null;
let packageToDelete = null;

// Create package
// async function createPackage(packageData) {
//   try {
//     const response = await fetch(`${API_BASE}/packages`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(packageData),
//     });

//     if (!response.ok) throw new Error("Failed to create package");

//     return await response.json();
//   } catch (error) {
//     console.error("Error creating package:", error);
//   }
// }

// UPDATE package
async function updatePackage(packageId, packageData) {
  try {
    const response = await fetch(`${API_BASE}/packages/${packageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packageData),
    });

    if (!response.ok) throw new Error("Failed to update package");

    return await response.json();
  } catch (error) {
    console.error("Error updating package:", error);
  }
}

// DELETE package
async function deletePackage(packageId) {
  try {
    const response = await fetch(`${API_BASE}/packages/${packageId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to delete package");

    displayPackages();
    return await response.json();
  } catch (error) {
    console.error("Error deleting package:", error);
  }
}

// Open package delete modal
function deletePackageModal(packageId) {
  packageToDelete = packageId;
  document.getElementById("deleteModal2").style.display = "block";
}

const confirmBtn = document.getElementById("confirmDelete2");

if (confirmBtn) {
  confirmBtn.addEventListener("click", async () => {
    if (packageToDelete) {
      await deletePackage(packageToDelete);
      packageToDelete = null;
    }

    document.getElementById("deleteModal2").style.display = "none";
  });
}

const cancelBtn = document.getElementById("cancelDelete2");

if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    packageToDelete = null;
    document.getElementById("deleteModal2").style.display = "none";
  });
}

const closeBtn = document.getElementById("deleteModalClose2");

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    packageToDelete = null;
    document.getElementById("deleteModal2").style.display = "none";
  });
}
