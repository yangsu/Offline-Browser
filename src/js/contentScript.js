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

  var links = {
    root: window.location.href,
    anchors: [],
    images: [],
    stylesheets: []
  };

  $('a').each(function (i, link) {
    links.anchors.push(link.href);
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
              data: img.src
            }, function (response) {
              img.src = response.data;
            });
          });
          $('link', document).each(function (i, linktag) {
            sendRequest({
              type: 'url',
              data: linktag.href
            }, function (response) {
              $('<style type="text/css">' + response.data + '</style>').appendTo('head');
              $(this).remove();
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
    links.images.push(img.src);
  });

  // Save all stylesheets
  $('link').each(function (i, linktag) {
    if ($(linktag).attr('rel') === 'stylesheet')
      links.stylesheets.push(linktag.href);
  });

  sendRequest({
    type: 'links',
    data: links
  }, function (response) {
    // do nothing
  });
});