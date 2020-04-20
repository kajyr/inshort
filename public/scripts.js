// Cache DOM elements in memory
var form = document.getElementById("shorten-form");
var urlBox = form.elements[0];
var link = document.getElementById("link");
var shrBox = document.getElementById("shortened");

var postEndpoint = "/.netlify/functions/post";

function displayShortenedUrl(response) {
	const url = `${location.href}${response.hash}`;
	link.textContent = url;
	link.setAttribute("href", url);
	shrBox.classList += " visible";
	//urlBox.value = "";
}

const errorMessages = {
	500: "Oops, error on our side",
	400: "Missing URL",
	default:
		"Are you sure the URL is correct? Make sure it has http:// at the beginning."
};

function alertError(code) {
	alert(errorMessages[code] || errorMessages.default);
}

form.addEventListener("submit", function(event) {
	event.preventDefault();
	fetch(postEndpoint, {
		method: "POST",
		body: JSON.stringify({ url: urlBox.value })
	}).then(response => {
		if (response.status >= 400) {
			if (response.body) {
				return response.json().then(data => {
					console.log("eeoe", data);
				});
			}
			return alertError(response.status);
		}
		return response.json().then(displayShortenedUrl);
	});
});
