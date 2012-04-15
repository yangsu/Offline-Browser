var extOptions = (function () {

  return {
    //saves options to localStorage
    'save_options': function () {
      var select = document.getElementById("color"),
        color = select.children[select.selectedIndex].value;
      localStorage.favorite_color = color;

      // Update status to let user know options were saved.
      var status = document.getElementById("status");
      status.innerHTML = "Options Saved.";
      setTimeout(function () {
        status.innerHTML = "";
      }, 750);
    },

    //restores select box state to saved value from localStorage
    'restore_options': function () {
      var favorite = localStorage.favorite_color;
      if (!favorite) {
        return;
      }
      var select = document.getElementById("color"),
        i, child;
      for (i = 0; i < select.children.length; i += 1) {
        child = select.children[i];
        if (child.value === favorite) {
          child.selected = "true";
          break;
        }
      }
    }
  };

}());

$(document).ready(function () {
  extOptions.restore_options();
  console.log('Hello from Options');
});