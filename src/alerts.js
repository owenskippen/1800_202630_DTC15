const alertCards = document.querySelectorAll(".alert-card");

for (const card of alertCards) {
  card.addEventListener("click", function () {
    const title = card.querySelector("strong").textContent;
    const details = card.querySelector(".alert-details");
    details.hidden = !details.hidden;
    console.log(title);
  });
}
