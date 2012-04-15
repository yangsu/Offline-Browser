document.onreadystatechange = function() {
    if (document.readyState == "complete") {
        console.log('Hello from Background Script');
    }
};

function cacheURL(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            data = xhr.responseText;
        }
    }
    xhr.send();
}