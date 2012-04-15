$(document).ready(function () {
  console.log('Hello from Background Script');

  // Send request to current tab
  sendRequest = function (data) {
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.sendRequest(
        tab.id,
        { message: data },
        function (response) {
          console.log(response.message);
        }
      );
    });
  };

  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
                'from a content script:' + sender.tab.url :
                'from the extension');
    console.log(request.message);
    sendResponse({ message: request.message });
  });
});

function handleDOM(dom) {
  var links = dom.getElementsByTagName('a'),
    i, url;
  for (i = 0; i < links.length; i += 1) {
    url = links[i].getAttribute('href');
    if (url.indexOf('http://') === 0 || url.indexOf('https://')) {
      cacheURL(url);
    }
  }
}

function cacheURL(url) {
  $.get(url, function (data) {
    localStorage[url] = data;
  });
}