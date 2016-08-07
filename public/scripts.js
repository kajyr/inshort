// Cache DOM elements in memory
var form   = document.getElementById('shorten-form');  
var urlBox = form.elements[0];  
var link   = document.getElementById('link');  
var shrBox = document.getElementById('shortened');

// Callback function passed to Axios' .post().then()
function displayShortenedUrl(response) {

	link.textContent = response.shortUrl;
	link.setAttribute( 'href', response.shortUrl );
	shrBox.classList += ' visible'
	urlBox.value = '';
}

// Callback function passed to Axios' error handler
function alertError(error) {  
	// Handle server or validation errors
	alert('Are you sure the URL is correct? Make sure it has http:// at the beginning.');
} // End of function to display errors on the page

form.addEventListener('submit', function(event) {  
	event.preventDefault();

	nanoajax.ajax({
			url: '/new',
			method: 'POST',
			body: 'url=' + urlBox.value
		}, (code, responseText, request) => {
			if (code !== 200) {
				return alertError(responseText);
			}
			displayShortenedUrl(JSON.parse(responseText));
		
	})
});
