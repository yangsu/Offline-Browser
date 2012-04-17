var offline = false;

function markLinkSaved(id) {
  $('#' + id).css('color', 'green');
}

function parseUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a;
}

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if(request === 'recording') {
      console.log('saving page');
      savePage();
    }
    else if(request.indexOf('anchor') === 0) {
      markLinkSaved(request);
    }
  });

sendRequest = function (data, callback) {
  chrome.extension.sendRequest(data, callback);
};

savePage = function() {
  var links = {
    root: window.location.href,
    anchors: [],
    images: [],
    stylesheets: []
  };

  $('a').each(function (i, link) {
    var location = parseUrl(link.href);
    if(/(http(s)?):/.test(location.protocol) && link.href.indexOf('#') !== 0) {
      var id = 'anchor' + i;
      $(link).attr('id', id);
      $(link).css('color', 'red');
      var obj = {
        href: link.href,
        id: id
      };
      links.anchors.push(obj);
    }
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
}

$(document).ready(function () {
  console.log('Hello from Content Script');

  $('a').live('click', function (event) {
    if(!navigator.onLine){
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
      }
  });
});