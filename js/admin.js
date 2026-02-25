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
}

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

document.addEventListener("DOMContentLoaded", function () {
	var ordersTable = document.getElementById("orders-table-main");
	var modal = document.getElementById("order-modal");
	var modalClose = document.getElementById("order-modal-close");
	var modalCloseBtn = document.getElementById("order-close");
	var fieldId = document.getElementById("modal-order-id");
	var fieldCustomer = document.getElementById("modal-order-customer");
	var fieldDate = document.getElementById("modal-order-date");
	var fieldOffer = document.getElementById("modal-order-offer");
	var fieldStatus = document.getElementById("modal-order-status");

	function openOrderModal(data) {
		if (!modal) return;
		fieldId.textContent = data.id || "";
		fieldCustomer.textContent = data.customer || "";
		fieldDate.textContent = data.date || "";
		fieldOffer.textContent = data.offer || "";
		fieldStatus.textContent = data.status || "";
		modal.classList.add("open");
	}

	function closeOrderModal() {
		if (!modal) return;
		modal.classList.remove("open");
	}

	if (ordersTable) {
		ordersTable.addEventListener("click", function (evt) {
			var btn = evt.target.closest("button");
			if (!btn) return;
			if (btn.textContent.trim().toLowerCase() !== "bekijken") return;

			var row = btn.closest("tr");
			if (!row) return;
			var cells = row.querySelectorAll("td");
			if (cells.length < 5) return;

			openOrderModal({
				row: row,
				id: cells[0].textContent.trim(),
				customer: cells[1].textContent.trim(),
				date: cells[2].textContent.trim(),
				offer: cells[3].textContent.trim(),
				status: cells[4].textContent.trim(),
			});
		});
	}

	[modalClose, modalCloseBtn].forEach(function (btn) {
		if (btn) {
			btn.addEventListener("click", closeOrderModal);
		}
	});

	if (modal) {
		modal.addEventListener("click", function (evt) {
			if (evt.target === modal) {
				closeOrderModal();
			}
		});
	}
});
