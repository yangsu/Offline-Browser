$(document).ready(function () {
  console.log('Hello from Content Script');
  sendRequest = function (data, callback) {
    chrome.extension.sendRequest(data, callback);
  };
  chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
                'from a content script:' + sender.tab.url :
                'from the extension');
    console.log(request.data);
    // sendResponse({ data: request.data });
  });

  // initialize links first with the current page's url
  var links = [ window.location.href ];
  $('a').each(function (num, link) {
    links.push(link.href);
  })
  .live('click', function (event) {
    var url = event.target.href;
    sendRequest({
      type: 'url',
      data: url
    }, function (response) {
      var data = response.data;
      if (data)
        document.write(data);
    });
    event.preventDefault();
  });
  sendRequest({
    type: 'links',
    data: links
  }, function (response) {
    // do nothing
  });
});