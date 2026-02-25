const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File paths
const ordersPath = path.join(__dirname, "data", "orders", "orders.json");
const packagesPath = path.join(__dirname, "data", "packages", "packages.json");

// Helper function to read JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(data);
    
    // Return the array from the nested structure
    if (parsed.orders) return parsed.orders;
    if (parsed.packages) return parsed.packages;
    return parsed;
  } catch (error) {
    return [];
  }
}

// Helper function to write JSON file
function writeJsonFile(filePath, dataArray) {
  const isOrders = filePath.includes("orders");
  const structure = isOrders ? { orders: dataArray } : { packages: dataArray };
  fs.writeFileSync(filePath, JSON.stringify(structure, null, 2));
}

// GET all orders
app.get("/data/orders", (req, res) => {
  const orders = readJsonFile(ordersPath);
  res.json(orders);
});

// GET order by ID
app.get("/data/orders/:id", (req, res) => {
  const orders = readJsonFile(ordersPath);
  const order = orders.find((o) => o.id === parseInt(req.params.id));

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});

// POST new order
app.post("/data/orders", (req, res) => {
  const orders = readJsonFile(ordersPath);
  const validIds = orders.filter((o) => o.id).map((o) => o.id);
  const newOrder = {
    id: validIds.length > 0 ? Math.max(...validIds) + 1 : 1,
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  writeJsonFile(ordersPath, orders);

  res.status(201).json(newOrder);
});

// PUT update order
app.put("/data/orders/:id", (req, res) => {
  const orders = readJsonFile(ordersPath);
  const orderIndex = orders.findIndex((o) => o.id === parseInt(req.params.id));

  if (orderIndex === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  orders[orderIndex] = {
    ...orders[orderIndex],
    ...req.body,
    id: parseInt(req.params.id),
  };

  writeJsonFile(ordersPath, orders);
  res.json(orders[orderIndex]);
});

// DELETE order
app.delete("/data/orders/:id", (req, res) => {
  const orders = readJsonFile(ordersPath);
  const orderIndex = orders.findIndex((o) => o.id === parseInt(req.params.id));

  if (orderIndex === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  const deletedOrder = orders.splice(orderIndex, 1);
  writeJsonFile(ordersPath, orders);

  res.json({ message: "Order deleted", order: deletedOrder[0] });
});

// GET all packages
app.get("/data/packages", (req, res) => {
  const packages = readJsonFile(packagesPath);
  res.json(packages);
});

// GET package by ID
app.get("/data/packages/:id", (req, res) => {
  const packages = readJsonFile(packagesPath);
  const pkg = packages.find((p) => p.id === parseInt(req.params.id));

  if (!pkg) {
    return res.status(404).json({ message: "Package not found" });
  }

  res.json(pkg);
});

// POST new package
app.post("/data/packages", (req, res) => {
  const packages = readJsonFile(packagesPath);
  const validIds = packages.filter((p) => p.id).map((p) => p.id);
  const newPackage = {
    id: validIds.length > 0 ? Math.max(...validIds) + 1 : 1,
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  packages.push(newPackage);
  writeJsonFile(packagesPath, packages);

  res.status(201).json(newPackage);
});

// PUT update package
app.put("/data/packages/:id", (req, res) => {
  const packages = readJsonFile(packagesPath);
  const packageIndex = packages.findIndex(
    (p) => p.id === parseInt(req.params.id),
  );

  if (packageIndex === -1) {
    return res.status(404).json({ message: "Package not found" });
  }

  packages[packageIndex] = {
    ...packages[packageIndex],
    ...req.body,
    id: parseInt(req.params.id),
  };

  writeJsonFile(packagesPath, packages);
  res.json(packages[packageIndex]);
});

// DELETE package
app.delete("/data/packages/:id", (req, res) => {
  const packages = readJsonFile(packagesPath);
  const packageIndex = packages.findIndex(
    (p) => p.id === parseInt(req.params.id),
  );

  if (packageIndex === -1) {
    return res.status(404).json({ message: "Package not found" });
  }

  const deletedPackage = packages.splice(packageIndex, 1);
  writeJsonFile(packagesPath, packages);

  res.json({ message: "Package deleted", package: deletedPackage[0] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
