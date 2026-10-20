// Log which home button was clicked (the link still opens its page)
function setupHomeButtons() {
  document.querySelectorAll(".home-btn").forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Home button clicked: " + button.id);
    });
  });
}

document.addEventListener("DOMContentLoaded", setupHomeButtons);
