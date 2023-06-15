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
		filterContainer.insertAdjacentHTML("beforeend",`<li class="filter__item" data-id="${folder.id}" onClick="setFilter(this);">
															<input type="radio" name="filters" id="folder${index}">
															<label for="folder${index}" onclick="event.stopPropagation();">${folder.name}</label>
														</li>`);
	});

	// Fix for double invocation of the setFilter(); function
	document.querySelectorAll(".filter__item label").forEach(filterItem => {
		filterItem.addEventListener("click", event => {
			event.stopPropagation();
		});
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

		let itemFolderId;
		item.folderId == null ? itemFolderId = "" : itemFolderId = item.folderId;

		itemsContainer.insertAdjacentHTML("beforeend",`<article class="vault-item" data-id="${item.id}" data-folder_id="${itemFolderId}" onClick="openPopup(this);">
															<img src="${faviconSRC}" alt="Logo">
															<div class="vault-item__name-login">	
																<h3>${item.name}</h3>
																<span>${item.login.username}</span>
															</div>
														</article>`);
	});

	vaultItemsLoader("none");
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
															<a href="${uri.uri}" target="_blank" class="popup__input_uri">${uri.uri}</a>
															<button class="popup__copy-btn" onClick="copyInputValue(this);"></button>
														</article>`);
	});


	// Setting value from item to the "Notes" section
	popupSection.notes.querySelector("p").textContent = item.notes;


	// Setting values from item to the "Custom fields" section
	if (item.fields) {
		item.fields.forEach(field => {

			let fieldTemplate,
				fieldName = `<h4>${field.name}</h4>`;
				fieldInput = `<input class="popup__input_copy" type="text" value="${field.value}" readonly>`,
				fieldInputHidden = `<input class="popup__input_password" type="password" value="${field.value}" readonly>`,
				fieldEyeBtn = `<button class="popup__eye-btn" onClick="showPassword(this);"></button>`,
				fieldCopyBtn = `<button class="popup__copy-btn" onClick="copyInputValue(this);"></button>`;

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
		
}

function resetPopup() {

	let oldURIs = popupSection.uris.querySelectorAll("article"),
		oldCustomFields = popupSection.customFields.querySelectorAll("article"),
		allOld = [...oldURIs, ...oldCustomFields];

	allOld.forEach(article => {
		article.remove();
	});
}

function search(input) {

	disableFilters();
	
	let searchQuery;
	if (input.value) {
		searchQuery = input.value;
	} else {
		searchClearBtnVisibility(0);
		allVaultItemsDisplay("");
		noVaultItems("none");
		return;
	}

	searchClearBtnVisibility(1);
	allVaultItemsDisplay("none");
	vaultItemsLoader("");

	let foundItems = vault.items.filter(item => {

		function isMatch(field) {
			return field.toLowerCase().includes(searchQuery.toLowerCase());
		}

		function findInArray(array, fieldName) {
			if (array) {

				let foundField = array.find(object => {
					if (object[fieldName] && isMatch(object[fieldName])) return true;
				});

				if (foundField) return true;
			}
		}

		// Check "name" field
		if (item.name && isMatch(item.name)) return true;

		// Check "notes" field
		if (item.notes && isMatch(item.notes)) return true;

		// Check "login.username" field
		if (item.login &&
			item.login.username &&
			isMatch(item.login.username)) return true;

		// Check "fields.name" field
		if (findInArray(item.fields, "name")) return true;

		// Check "fields.value" field
		if (findInArray(item.fields, "value")) return true;

		// Check "login.uris.uri" field
		if (findInArray(item.login.uris, "uri")) return true;
	});

	vaultItemsLoader("none");

	if (foundItems.length === 0) {
		allVaultItemsDisplay("none");
		noVaultItems("", "There are no items that match the search");
	} else {
		let foundItemsIds = foundItems.map(item => item.id);
		noVaultItems("none");
		showFilteredVaultItems(foundItemsIds, "id");
	}
}

function disableFilters() {
	let checkedFilter = document.querySelector('[name="filters"]:checked');
	if (checkedFilter) checkedFilter.checked = false;
	currentFilter = undefined;
}

function allVaultItemsDisplay(displayStyle) {
	document.querySelectorAll(".vault-items article").forEach(item => {
		item.style.display = displayStyle;
	});
}

function showFilteredVaultItems(array, type) {
	if (type == "id") {
		array.forEach(id => {
			document.querySelector(`[data-id="${id}"]`).style.display = "";
		});
	}
}

function noVaultItems(displayStyle, text) {
	let noVaultItemsElem = document.querySelector(".vault-items__no-items");
	noVaultItemsElem.style.display = displayStyle;
	if (text) noVaultItemsElem.textContent = text;
}

function vaultItemsLoader(displayStyle) {
	document.querySelector(".vault-items__loading").style.display = displayStyle;
}

function searchClearBtnVisibility(value) {
	let btn = document.querySelector(".search__clear-btn");

	value ? btn.classList.add("search__clear-btn_visible") : btn.classList.remove("search__clear-btn_visible");
}

function clearSearchInput() {
	document.querySelector("#search-input").value = "";
	allVaultItemsDisplay("");
	noVaultItems("none");
	searchClearBtnVisibility(0);
}

function copyInputValue(btn) {
	let copyText;
	if (btn.parentNode.querySelector("input")) {
		copyText = btn.parentNode.querySelector("input").value;
	} else {
		copyText = btn.parentNode.querySelector("a").textContent;
	}
	navigator.clipboard.writeText(copyText);
	inputBtnClicked(btn);
}

function inputBtnClicked(btn) {
	btn.style.opacity = 0;
	btn.style.transform = "scale(0)";

	setTimeout(() => {

		btn.style.opacity = 1;
		btn.style.transform = "scale(1)";
	}, 100);
}

function showPassword(btn) {
	let input = btn.parentNode.querySelector("input");
	if (input.type == "password") {
		input.type = "text";
		changeIcon("add");
	} else {
		input.type = "password";
		changeIcon("remove");
	}

	function changeIcon(action) {

		inputBtnClicked(btn);

		setTimeout(() => {
			if (action == "remove") {
				btn.classList.remove("close");
			} else {
				btn.classList.add("close");
			}
		}, 100);
	}
}

let currentFilter;
function setFilter(btn) {

	let id = btn.dataset.id;

	noVaultItems("none");
	document.querySelector("#search-input").value = "";
	searchClearBtnVisibility(0);

	if (currentFilter) {
		if (currentFilter == id) {
			disableFilters();
			document.querySelectorAll(".vault-item").forEach(item => {
				item.style.display = "";
			});
			return;
		} else {
			currentFilter = id;
		}
	} else {
		currentFilter = id;
	}

	if (id == "NO_FOLDER") id = "";
	let itemsWithId = document.querySelectorAll(`.vault-item[data-folder_id="${id}"]`);

	document.querySelectorAll(".vault-item").forEach(item => {
		if (item.dataset.folder_id == id) {
			item.style.display = "";
		} else {
			item.style.display = "none";
		}
	});

	if (itemsWithId.length == 0) {
		noVaultItems("", "There are no items that match the filter");
	}
}
