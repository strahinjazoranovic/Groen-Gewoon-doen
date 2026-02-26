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
  const statuses = ["In behandeling", "Verzonden", "Geleverd"];
  const status = prompt(`Update order status:\n${statuses.join("\n")}`);
  if (status && statuses.includes(status)) {
    await updateOrder(orderId, { status });
    displayOrdersAdmin(".orders-table");
  }
}

// Edit package
async function editPackage(packageId) {
  const packages = await fetchPackages();
  const pkg = packages.find((p) => p.id === packageId);
  if (pkg) {
    document.getElementById("package-name").value = pkg.name;
    document.getElementById("package-price").value = pkg.price;
    document.getElementById("package-id").value = pkg.id;
    document.querySelector(".packages-form-title").textContent =
      "Pakket Bewerken";
  }
}

// Clear package form
function clearPackageForm() {
  document.getElementById("package-name").value = "";
  document.getElementById("package-price").value = "";
  document.getElementById("package-id").value = "";
  document.querySelector(".packages-form-title").textContent = "Nieuw Pakket";
}

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