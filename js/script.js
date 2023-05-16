const popup = document.querySelector(".popup");



function openPopup(e) {
	generatePopup(e);
	popup.classList.add("popup_open");
}

function closePopup() {
	popup.classList.remove("popup_open");
}



// Closing the popup when clicking on the background 
// Checking that the mousedown and mouseup events are triggered on the same element
// If you simply use the click event, a bug appears.
document.addEventListener("mousedown", event => {

	if (event.target.classList.contains("popup")) {

		let checkMouseUp = function(event) {

			if (event.target.classList.contains("popup")) {
				closePopup();
			}

			document.removeEventListener("mouseup", checkMouseUp);
		}

		document.addEventListener('mouseup', checkMouseUp);
	}
});
