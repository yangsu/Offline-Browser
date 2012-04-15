document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        console.log('Hello from Background Script');
    }
};

function handleDOM(dom) {
    links = dom.getElementsByTagName('a');
    for(var i = 0; i < links.length; i++) {
        url = links[i].getAttribute('href');
        if(url.indexOf('http://') == 0 || url.indexOf('https://')) {
            cacheURL(url);
        }
    }
}

function cacheURL(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            data = xhr.responseText;
            localStorage[url] = data;
        }
    }
    xhr.send();
}