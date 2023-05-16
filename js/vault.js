let vault;

fetch('json/vault.json')
	.then(response => response.json())
	.then(data => {
		vault = data;
		generateFilters();
	});



function generateFilters() {
	
	generateFoldersFilter();
}

function generateFoldersFilter() {
	let filterContainer = document.querySelector("#filter-folders .filter__items");

	console.log(filterContainer);

	vault.folders.forEach( (folder, index) => {
		filterContainer.insertAdjacentHTML("beforeend",`<li class="filter__item" data-id="${folder.id}" onClick="setFilter();">
															<input type="radio" name="filters" id="folder${index}">
															<label for="folder${index}">${folder.name}</label>
														</li>`);
	});
}

function setFilter() {

}
