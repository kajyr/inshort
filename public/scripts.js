// Cache DOM elements in memory
var form   = document.getElementById('shorten-form');  
var urlBox = form.elements[0];  
var link   = document.getElementById('link');  
var shrBox = document.getElementById('shortened');

function displayShortenedUrl(response) {

	link.textContent = response.shortUrl;
	link.setAttribute( 'href', response.shortUrl );
	shrBox.classList += ' visible'
	urlBox.value = '';
}

function alertError(error) {  
	alert('Are you sure the URL is correct? Make sure it has http:// at the beginning.');
}

function appendHttp(url) {
	if (url.match(/^www\./i)) {
		return 'http://' + url;
	}
	return url;
}

form.addEventListener('submit', function(event) {  
	event.preventDefault();

	nanoajax.ajax({
			url: '/new',
			method: 'POST',
			body: 'url=' + appendHttp(urlBox.value)
		}, (code, responseText, request) => {
			if (code !== 200) {
				return alertError(responseText);
			}
			displayShortenedUrl(JSON.parse(responseText));
		
	})
});
