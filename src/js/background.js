var globaldatastore = {};
$(document).ready(function () {
  console.log('Hello from Background Script');

  // Send request to current tab
  sendRequest = function (data) {
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.sendRequest(
        tab.id,
        data
      );
    });
  };

  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
                'from a content script:' + sender.tab.url :
                'from the extension');
    console.log(request.data);
    if (request.type === 'url') {
      sendResponse({
        data: globaldatastore[sender.tab.id][request.data]
      });
    }
    else if (request.type === 'links') {
      var links = request.data,
        i, l, url;
      globaldatastore[sender.tab.id] = {};
      for (i = 0, l = links.length; i < l; i += 1) {
        url = links[i];
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
          cacheURL(sender.tab.id, url);
        }
      }
    }
  });
});

function cacheURL(tabid, url) {
  $.get(url, function (data) {
    globaldatastore[tabid][url] = data;
  });
}

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  delete globaldatastore[tabId];
});
