document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    console.log('Hello from Background Script');
  }
};