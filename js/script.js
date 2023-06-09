const popup = document.querySelector(".popup");



function openPopup(e) {
	generatePopup(e);
	popup.classList.add("popup_open");
}

function closePopup() {
	popup.classList.remove("popup_open");
}

function setVH() {
	let vh100 = window.innerHeight;
	let vh1 = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh100', `${vh100}px`);
	document.documentElement.style.setProperty('--vh1', `${vh1}px`);
};



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

window.addEventListener("resize", event => {
	setVH();
});

window.addEventListener('load', () => {
	setVH();
});