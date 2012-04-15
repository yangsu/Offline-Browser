$(document).ready(function () {
  console.log('Hello from Content Script');
  sendRequest = function (data) {
    chrome.extension.sendRequest(
      { message: data },
      function (response) {
        console.log(response.message);
      }
    );
  };
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
                'from a content script:' + sender.tab.url :
                'from the extension');
    console.log(request.message);
    sendResponse({ message: request.message });
  });

  var links = [];
  $('a').each(function (num, link) {
    links.push(link.href);
  });
  sendRequest(links);
});