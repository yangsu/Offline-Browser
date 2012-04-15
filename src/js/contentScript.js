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
  $('a').each(function (i, link) {
    links.push(link.href);
  })
  .live('click', function (event) {
    var url = event.target.href;
    sendRequest({
      type: 'url',
      data: url
    }, function (response) {
      var data = response.data;
      if (data) {
        if (data.type === 'html') {
          document.write(data.data);
          $('img', document).each(function (i, img) {
            sendRequest({
              type: 'url',
              data: url
            }, function (response) {
              img.src = data.data;
            });
          });
        }
        else if (data.type === 'image') {
          document.write('<html><body></body></html>');
          var i = new Image();
          i.src = data.data;
          document.body.appendChild(i);
        }
      }
    });
    event.preventDefault();
  });

  // Save all images
  $('img').each(function (i, img) {
    links.push(img.src);
  });

  sendRequest({
    type: 'links',
    data: links
  }, function (response) {
    // do nothing
  });
});