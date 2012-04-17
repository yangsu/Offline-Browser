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
    if(request === 'recording' && navigator.onLine) {
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
    if(/(http(s)?):/.test(location.protocol) && link.href.indexOf('#') !== 0 && link.href.indexOf('mailto:') === -1) {
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

  sendRequest({
    type: 'links',
    data: links
  }, function (response) {
    // do nothing
  });
};

$(document).ready(function () {
  console.log('Hello from Content Script');

  $(document.body).delegate('a','click', function (event) {
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
        event.stopPropagation();
      }
  });
});