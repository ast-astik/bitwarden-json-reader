let vault;

fetch('json/vault.json')
	.then(response => response.json())
	.then(data => {
		vault = data;
		generateElemsFromJSON();
	});



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

		itemsContainer.insertAdjacentHTML("beforeend",`<article class="vault-item" data-id="${item.id}" data-folder-id="${item.folderId}" onClick="openPopup();">
															<img src="${faviconSRC}" alt="Logo">
															<div class="vault-item__name-login">	
																<h3>${item.name}</h3>
																<span>${item.login.username}</span>
															</div>
														</article>`);
	});
}

function setFilter() {

}
