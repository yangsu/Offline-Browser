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
    var links = request.message,
      i, l, url;
    for (i = 0, l = links.length; i < l; i += 1) {
      url = links[i];
      if (url.indexOf('http://') === 0 || url.indexOf('https://')) {
        cacheURL(url);
      }
    }
    sendResponse({ message: request.message });
  });
});

function cacheURL(url) {
  $.get(url, function (data) {
    localStorage[url] = data;
  });
}