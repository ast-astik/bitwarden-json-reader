let vault;

fetch('json/vault.json')
	.then(response => response.json())
	.then(data => {
		vault = data;
		generateElemsFromJSON();
	});



// Getting some sections of popup
let ps = "#popup-section";
const popupSection = {
	"uris": document.querySelector(`${ps}-uris`),
	"notes": document.querySelector(`${ps}-notes`),
	"customFields": document.querySelector(`${ps}-custom-fields`),
}



function generateElemsFromJSON() {
	
	generateFoldersFilter();
	generateVaultItems();
}

function generateFoldersFilter() {
	let filterContainer = document.querySelector("#filter-folders .filter__items");

	vault.folders.forEach( (folder, index) => {
		filterContainer.insertAdjacentHTML("beforeend",`<li class="filter__item" data-id="${folder.id}" onClick="setFilter();">
															<input type="radio" name="filters" id="folder${index}">
															<label for="folder${index}">${folder.name}</label>
														</li>`);
	});
}

function generateVaultItems() {
	let itemsContainer = document.querySelector(".vault-items");

	vault.items.forEach( (item) => {

		let faviconSRC;

		if (navigator.onLine) {
			faviconSRC = `http://www.google.com/s2/favicons?domain=${item.login.uris[0].uri}`;
		} else {
			faviconSRC = `img/nofavicon.svg`;
		}

		itemsContainer.insertAdjacentHTML("beforeend",`<article class="vault-item" data-id="${item.id}" data-folder-id="${item.folderId}" onClick="openPopup(this);">
															<img src="${faviconSRC}" alt="Logo">
															<div class="vault-item__name-login">	
																<h3>${item.name}</h3>
																<span>${item.login.username}</span>
															</div>
														</article>`);
	});
}

function generatePopup(e) {

	resetPopup();


	// Searching for an item by its ID
	let item = vault.items.find(item => item.id == e.dataset.id);


	// Setting values from item to the "Item information" section
	function itemInfoInput(name, value) {
		document.querySelector(`#popup-input-${name}`).value = value;
	}
	itemInfoInput("name", item.name);
	itemInfoInput("username", item.login.username);
	itemInfoInput("password", item.login.password);


	// Setting values from item to the "URIs" section
	item.login.uris.forEach(uri => {
		popupSection.uris.insertAdjacentHTML("beforeend", `<article>
															<h4>Website</h4>
															<input class="popup__input_copy" type="text" value="${uri.uri}" readonly>
															<button class="popup__copy-btn"></button>
														</article>`);
	});


	// Setting value from item to the "Notes" section
	popupSection.notes.querySelector("p").textContent = item.notes;


	// Setting values from item to the "Custom fields" section
	item.fields.forEach(field => {

		let fieldTemplate,
			fieldName = `<h4>${field.name}</h4>`;
			fieldInput = `<input class="popup__input_copy" type="text" value="${field.value}" readonly>`,
			fieldInputHidden = `<input class="popup__input_password" type="password" value="${field.value}" readonly>`,
			fieldEyeBtn = `<button class="popup__eye-btn"></button>`,
			fieldCopyBtn = `<button class="popup__copy-btn"></button>`;

		if (field.type === 0) { // text
			fieldTemplate =`<article>
								${fieldName}
								${fieldInput}
								${fieldCopyBtn}
							</article>`;
		} else if (field.type === 1) { // hidden
			fieldTemplate =`<article>
								${fieldName}
								${fieldInputHidden}
								${fieldEyeBtn}
								${fieldCopyBtn}
							</article>`;
		} else if (field.type === 2) { // Boolean
			
			let color;
			if (field.value == "false") {
				color = "#FF0000";
			} else {
				color = "#008000";
			}

			fieldTemplate =`<article>
								${fieldName}
								<input type="text" style="color: ${color};" value="${field.value}" readonly>
							</article>`;
		} else {
			return;
		}

		popupSection.customFields.insertAdjacentHTML("beforeend", fieldTemplate);
	});
}

function resetPopup() {

	let oldURIs = popupSection.uris.querySelectorAll("article"),
		oldCustomFields = popupSection.customFields.querySelectorAll("article"),
		allOld = [...oldURIs, ...oldCustomFields];

	allOld.forEach(article => {
		article.remove();
	});
}

function setFilter() {

}