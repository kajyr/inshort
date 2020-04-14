// Cache DOM elements in memory
var form = document.getElementById("shorten-form");
var urlBox = form.elements[0];
var link = document.getElementById("link");
var shrBox = document.getElementById("shortened");

var postEndpoint = "/.netlify/functions/post";

function displayShortenedUrl(response) {
	link.textContent = response.shortUrl;
	link.setAttribute("href", response.shortUrl);
	shrBox.classList += " visible";
	urlBox.value = "";
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

function appendHttp(url) {
	if (url.match(/^www\./i)) {
		return "http://" + url;
	}
	return url;
}

form.addEventListener("submit", function(event) {
	event.preventDefault();
	fetch(postEndpoint, {
		method: "POST",
		body: JSON.stringify({ url: appendHttp(urlBox.value) })
	}).then(response => {
		if (response.status >= 400) {
			if (response.body) {
				return response.json().then(data => {
					console.log("eeoe", data);
				});
			}
			return alertError(response.status);
		}
		return response.json().then(data => {
			console.log(data);
		});
	});
	/*
		(code, responseText, request) => {
			
			displayShortenedUrl(JSON.parse(responseText));
		}
	); */
});
