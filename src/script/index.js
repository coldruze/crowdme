const svg = {
	cache: {},
	_insert: function (img, code) {
		const parent = img.parentNode;
		if (parent) {
			parent.insertAdjacentHTML("afterbegin", code);
			const svg = parent.querySelector("svg");
			if (svg) {
				svg.classList = img.classList;
				svg.id = img.id;
				svg.setAttribute("role", "img");
				const title = img.alt || img.getAttribute("aria-label") || null;
				svg.setAttribute("aria-label", title || "false");
			}
			parent.removeChild(img);
		}
	},
	load: function (container = document) {
		[].forEach.call(
			document.querySelectorAll("img[src*='.svg']"),
			(img) => {
				if (
					!img.dataset ||
					typeof img.dataset.original === "undefined"
				) {
					const data = img.parentNode.querySelector("svg");
					if (data) {
						data.parentNode.removeChild(data);
					}
					const src = img.src;
					if (typeof this.cache[src] !== "undefined") {
						svg._insert(img, svg.cache[src]);
					} else {
						fetch(src, {
							cache: "no-cache",
						})
							.then((response) => {
								if (response.ok) {
									return response.text();
								}
							})
							.then((text) => {
								if (typeof text !== "undefined") {
									svg._insert(img, text);
									svg.cache[src] = text;
								}
							});
					}
				}
			}
		);
	},
};

document.addEventListener("DOMContentLoaded", function(e){
	svg.load();
});


