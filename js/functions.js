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

// Display orders in table
async function displayOrders(tableSelector) {
  const orders = await fetchOrders();
  const tbody = document.querySelector(`${tableSelector} tbody`);

  if (!tbody) return;

  tbody.innerHTML = ""; // Clear existing rows

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.address}</td>
      <td>${order.delivery}</td>
      <td>€${order.total}</td>
      <td>${order.status}</td>
    `;
    tbody.appendChild(row);
  });
}

// Display orders in admin table
async function displayOrdersAdmin(tableSelector) {
  const orders = await fetchOrders();
  const tbody = document.querySelector(`${tableSelector} tbody`);

  if (!tbody) return;

  tbody.innerHTML = ""; // Clear existing rows

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
        <button class="btn btn-green" type="button" onclick="updateOrderStatus(${order.id})">Update</button>
        <button class="btn btn-danger" type="button" onclick="deleteOrderAdmin(${order.id})">Verwijder</button>
      </td>   
    `;
    tbody.appendChild(row);
  });
}

// Display packages in table
async function displayPackages() {
  const packages = await fetchPackages();
  const packagesDiv = document.querySelector(".packages-table");

  if (!packagesDiv) return;

  // Keep the header row and clear other rows
  const header = packagesDiv.querySelector(".packages-head");
  packagesDiv.innerHTML = "";
  packagesDiv.appendChild(header);

  packages.forEach((pkg) => {
    const row = document.createElement("div");
    row.className = "packages-row";
    row.innerHTML = `
      <div>${pkg.name}</div>
      <div>€ ${pkg.price || 0}</div>
      <div><button class="btn btn-muted" type="button" onclick="editPackage(${pkg.id})">Bewerk</button></div>
      <div><button class="btn btn-danger" type="button" onclick="deletePackage(${pkg.id})">Verwijder</button></div>
    `;
    packagesDiv.appendChild(row);
  });
}

// CREATE: Add new order
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
    return null;
  }
}

// UPDATE: Update order by ID
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
    return null;
  }
}

// DELETE: Delete order by ID
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
    return null;
  }
}

// Delete order from admin/user panel with confirmation
async function deleteOrderAdmin(orderId) {
  if (confirm("Are you sure you want to delete this order?")) {
    await deleteOrder(orderId);
    displayOrders(".orders-table");
  }
}

// CREATE: Add new package
async function createPackage(packageData) {
  try {
    const response = await fetch(`${API_BASE}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packageData),
    });
    if (!response.ok) throw new Error("Failed to create package");
    return await response.json();
  } catch (error) {
    console.error("Error creating package:", error);
    return null;
  }
}

// UPDATE: Update package by ID
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
    return null;
  }
}

// DELETE: Delete package by ID
async function deletePackage(packageId) {
  try {
    if (!confirm("Are you sure you want to delete this package?")) return;
    const response = await fetch(`${API_BASE}/packages/${packageId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to delete package");
    displayPackages(); // Refresh the package list
    return await response.json();
  } catch (error) {
    console.error("Error deleting package:", error);
    return null;
  }
}
