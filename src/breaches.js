const emailCheckForm = document.getElementById("emailCheckForm");
const emailInput = document.getElementById("emailInput");
const emailCheckMessage = document.getElementById("emailCheckMessage");
const emailResults = document.getElementById("emailResults");

emailCheckForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();

    emailCheckMessage.textContent = "Checking email...";
    emailResults.innerHTML = "";
    
    // API used is XposedOrNot, no API key is needed, just backend server.
    try {
        const response = await fetch(
            `/api/check-email?email=${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Email check failed.");
        }

        if (data.found) {
            emailCheckMessage.textContent =
                "Your email was found in known data breaches.";

            data.breaches.forEach(function (breach) {
                const breachCard = document.createElement("div");
                breachCard.className = "card p-3 mb-2";

                const breachTitle = document.createElement("h5");
                breachTitle.textContent = breach;

                breachCard.appendChild(breachTitle);
                emailResults.appendChild(breachCard);
            });

        } else {
            emailCheckMessage.textContent =
                "No matching breaches were found.";

        }

    } catch (error) {
        emailCheckMessage.textContent = error.message;
    }
});
