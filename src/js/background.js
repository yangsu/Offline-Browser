var globaldatastore = {};
var recording = false;

$(document).ready(function() {
  console.log('Hello from Background Script');

  // Send request to current tab
  sendRequest = function(data) {
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendRequest(
      tab.id, data);
    });
  };

  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
    // console.log(request.data);
    var tabid = sender.tab.id;
    if (request.type === 'url') {
      sendResponse({
        data: globaldatastore[tabid][request.data]
      });
    } else if (request.type === 'links') {

      if (recording) {
        var links = request.data,
          i, l, url;

        if (!globaldatastore[tabid]) {
          globaldatastore[tabid] = {};
        }

        // root will always have the correct url format. No need to check
        cacheURL(tabid, links.root, links.root, false);

        // process anchors
        for (i = links.anchors.length - 1; i >= 0; i -= 1) {
          anchor = links.anchors[i];
          var href = anchor.href;
          anchor.href = fixurl(links.root, href);
          cacheURL(tabid, href, anchor, true);
        }
      }

    }
  });
});

function processStyleSheets(tabid, key, url) {
  if (!globaldatastore[tabid][key]) {
    $.get(url, function(data) {
      console.log('stylesheets: '+url);
      // console.log(data);
      globaldatastore[tabid][key] = {
        type: 'stylesheet',
        data: data
      };
      // TODO process images in css?
      // Scan all images on the page
      var regex = /url.*\(['"]?([^'"]+)['"]?\)/g,
        match, imgkey;
      while (match = regex.exec(data)) {
        imgkey = match[1];
        // Avoid images that are already data urls
        if (imgkey.indexOf('data:image') === -1) {
          saveImage(tabid, imgkey, fixurl(url, imgkey));
        }
      }
    });
  }
}

function saveImage(tabid, key, imgurl) {
  if (!globaldatastore[tabid][key]) {
    getImageDataURL(imgurl, function(dataurl) {
      console.log(imgurl);
      globaldatastore[tabid][key] = {
        type: 'image',
        data: dataurl
      };
    });
  }
}

function cacheURL(tabid, key, anchor, notifySaved) {
  if (!globaldatastore[tabid][key]) {
    var url = anchor.href;
    $.get(url, function(data) {
      var ext = url.substring(url.lastIndexOf('.') + 1);
      if (ext && ext.length === 3 && /jpg|png|gif/.test(ext)) {
        saveImage(tabid, key, url);
      } else {
        globaldatastore[tabid][key] = {
          type: 'html',
          data: data
        };
        var temp;

        // Save all stylesheets
        var regex = /<link[^>]+href="([^"]+\.css)?"/g;
        while (match = regex.exec(data)) {
          temp = match[1];
          if (temp && temp.indexOf('print') === -1) {
            processStyleSheets(tabid, temp, fixurl(url, temp));
          }
        }

        // Scan all images on the page
        regex = /<img[^>]+src="([^"]+)"/g;
        while (match = regex.exec(data)) {
          imgkey = match[1];
          // Avoid images that are already data urls
          if (imgkey && imgkey.indexOf('data:image') === -1) {
            saveImage(tabid, imgkey, fixurl(url, imgkey));
          }
        }
        if(notifySaved) {
          sendRequest(anchor.id);
        }
      }
    });
  }
}

// Convert various formats to full urls

function fixurl(url, imgurl) {
  var prefix = '';
  if (imgurl.indexOf('http://') === 0 || imgurl.indexOf('https://') === 0) {
    return imgurl;
  } else if (imgurl.indexOf('//') === 0) {
    prefix = 'http:';
  } else if (imgurl.indexOf('/') === 0) {
    prefix = url.substring(0, url.indexOf('/', 8));
  } else {
    // if (imgurl.indexOf('..') === 0 || imgurl.indexOf('/') > 0)
    // ../../a.jpg, aoeu/aoeu.jpg, abc.jpg
    prefix = url.substring(0, url.lastIndexOf('/') + 1);
  }
  return prefix + imgurl;
}

// convert image from url to dataurl

function getImageDataURL(url, success, error) {
  var data, canvas, ctx, img = new Image();
  img.onload = function() {
    canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    try {
      success(canvas.toDataURL());
    } catch (e) {
      error(e);
    }
  };
  try {
    img.src = url;
  } catch (e) {
    error(e);
  }
}

function sendRecordingMessage() {
  if(recording) {
    sendRequest('recording');
  }
}

function setIcon() {
  if(!recording) {
    chrome.browserAction.setIcon({path: 'icons/icon19.png'});
  } else {
    chrome.browserAction.setIcon({path: 'icons/icon19_r.png'});
  }
}

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  delete globaldatastore[tabId];
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status === 'complete')
    sendRecordingMessage();
});

chrome.browserAction.onClicked.addListener(function(tab) {
  recording = !recording;
  setIcon();
  sendRecordingMessage();
});



