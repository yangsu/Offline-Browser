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
      if (!globaldatastore[sender.tab.id])
        globaldatastore[sender.tab.id] = {};
      for (i = links.length - 1; i >= 0; i -= 1) {
        url = links[i];
        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
          cacheURL(sender.tab.id, url);
        }
      }
    }
  });
});

function saveImage (tabid, imgurl) {
  if (!globaldatastore[tabid][imgurl]) {
    getImageDataURL(imgurl, function (dataurl) {
      globaldatastore[tabid][imgurl] = {
        type: 'image',
        data: dataurl
      };
    });
  }
}
function cacheURL(tabid, url) {
  if (!globaldatastore[tabid][url]) {
    $.get(url, function (data) {
      var ext = url.substring(url.lastIndexOf('.')+1);
      if (ext && ext.length === 3 && /jpg|png|gif/.test(ext)) {
        saveImage(tabid, url);
      }
      else {
        globaldatastore[tabid][url] = {
          type: 'html',
          data: data
        };

        // Scan all images on the page
        var regex = /<img[^>]+src="([^"]+)"/g,
          match;
        while (match = regex.exec(data)) {
          // Avoid images that are already data urls
          if (match[1].indexOf('data:image') === -1) {
            var imgurl = fixurl(url, match[1]);
            saveImage(tabid, imgurl);
          }
        }
      }
    });
  }
}

// Convert various formats to full urls
function fixurl(url, imgurl) {
  var prefix = '';
  if (imgurl.indexOf('http://') === 0 || imgurl.indexOf('https://') === 0)
    return imgurl;
  else if (imgurl.indexOf('//') === 0) {
    prefix = 'http:';
  }
  else if (imgurl.indexOf('/') === 0) {
    prefix = url.substring(0, url.indexOf('/', 8));
  }
  // if (imgurl.indexOf('..') === 0 || imgurl.indexOf('/') > 0)
  // ../../a.jpg, aoeu/aoeu.jpg, abc.jpg
  else {
    prefix = url.substring(0, url.lastIndexOf('/') + 1);
  }
  return prefix + imgurl;
}

// convert image from url to dataurl
function getImageDataURL(url, success, error) {
  var data, canvas, ctx;
  var img = new Image();
  img.onload = function (){
    canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    try {
      success(canvas.toDataURL());
    } catch(e){
      error(e);
    }
  };
  try {
    img.src = url;
  } catch(e) {
    error(e);
  }
}

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  delete globaldatastore[tabId];
});
