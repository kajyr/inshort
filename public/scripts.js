// Cache DOM elements in memory
const submitForm = document.getElementById('shorten-form');
var urlBox = document.querySelector('input[name="url"]');
var authBox = document.querySelector('input[name="auth"]');
var link = document.getElementById('link');
var shrBox = document.getElementById('shortened');

var postEndpoint = '/new';

function getShortened(elem) {
  return `${location.protocol}//${location.host}/${elem.hash}`;
}

function displayShortenedUrl(response) {
  if (!response) {
    return;
  }
  const url = getShortened(response);
  link.textContent = url;
  link.setAttribute('href', url);
  shrBox.classList += ' visible';
  //urlBox.value = "";
}

const errorMessages = {
  500: 'Oops, error on our side',
  400: 'Missing URL',
  401: 'Not authorized',
  default: 'Are you sure the URL is correct? Make sure it has http:// at the beginning.',
};

function alertError(code) {
  alert(errorMessages[code] || errorMessages.default);
}

function fetchJson(endpoint, options) {
  return fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...options,
  }).then((response) => {
    if (response.status >= 400) {
      return alertError(response.status);
    }
    return response.json();
  });
}

submitForm.addEventListener('submit', function (event) {
  event.preventDefault();
  fetchJson(postEndpoint, {
    method: submitForm.method.toUpperCase(),
    body: JSON.stringify({ url: urlBox.value, apiKey: authBox.value }),
  }).then(displayShortenedUrl);
});

// LIST
(function () {
  const listForm = document.getElementById('list-form');
  const listTable = document.getElementById('list-table');
  const listRowTemplate = document.getElementById('list-row-template');

  const listEndpoint = '/list';

  listForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const apiBox = listForm.querySelector('input[name="auth"]');

    fetchJson(`${listEndpoint}/${apiBox.value}`, {
      method: listForm.method.toUpperCase(),
    }).then((data) => {
      if (!data) {
        return;
      }

      listTable.classList += ' visible';
      const tbody = listTable.querySelector('tbody');

      for (elem of data) {
        const row = listRowTemplate.content.cloneNode(true);
        const tds = row.querySelectorAll('td');
        const link = row.querySelector('.shortened');

        tds[0].textContent = elem.url;
        link.setAttribute('href', getShortened(elem));
        link.textContent = getShortened(elem);
        tbody.appendChild(row);
      }
    });
  });
})();
