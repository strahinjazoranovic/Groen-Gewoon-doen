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
