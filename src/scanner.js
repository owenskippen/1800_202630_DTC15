// Get the elements from the scanner page
const linkInput = document.getElementById("linkInput");
const scanButton = document.getElementById("scanButton");
const scanMessage = document.getElementById("scanMessage");
const checkResultButton = document.getElementById("checkResultButton");
const scanResults = document.getElementById("scanResults");

// Store the analysis ID
let currentAnalysisId = "";

// Submit the URL to VirusTotal
scanButton.addEventListener("click", async function () {

    const url = linkInput.value.trim();

    if (url === "") {
        scanMessage.textContent = "Please enter a URL.";
        return;
    }

    scanMessage.textContent = "Submitting URL to VirusTotal...";
    scanResults.innerHTML = "";
    checkResultButton.hidden = true;
    scanButton.disabled = true;

    try {
        const response = await fetch("/api/scan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Something went wrong.");
        }

        currentAnalysisId = result.analysisId;

        scanMessage.textContent =
            "URL submitted! You can now check the results.";

        checkResultButton.hidden = false;

    } catch (error) {
        console.error("Scanning error:", error);
        scanMessage.textContent = error.message;

    } finally {
        scanButton.disabled = false;
    }
});


// Retrieve the scan results
checkResultButton.addEventListener("click", async function () {

    if (currentAnalysisId === "") {
        return;
    }

    checkResultButton.disabled = true;
    scanResults.textContent = "Retrieving scan results...";

    try {
        const response = await fetch(
            "/api/analysis/" + encodeURIComponent(currentAnalysisId)
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not get results.");
        }

        // Check if the scan has finished
        if (result.status !== "completed") {
            scanResults.textContent =
                "The scan is still processing. Please check again in a little while.";
            return;
        }

        // Get the detection statistics
        const stats = result.stats;

        const malicious = stats.malicious || 0;
        const suspicious = stats.suspicious || 0;
        const harmless = stats.harmless || 0;
        const undetected = stats.undetected || 0;

        // Display the results
        scanResults.innerHTML = `
            <h3>Scan Results</h3>
            <p><strong>Malicious:</strong> ${malicious}</p>
            <p><strong>Suspicious:</strong> ${suspicious}</p>
            <p><strong>Harmless:</strong> ${harmless}</p>
            <p><strong>Undetected:</strong> ${undetected}</p>
        `;

        if (malicious > 0 || suspicious > 0) {
            scanResults.insertAdjacentHTML(
                "afterbegin",
                "<h4>Potential threats detected</h4>"
            );
        } else {
            scanResults.insertAdjacentHTML(
                "afterbegin",
                "<h4>No threats detected by the reporting engines</h4>"
            );
        }

    } catch (error) {
        console.error("Results error:", error);
        scanResults.textContent = error.message;

    } finally {
        checkResultButton.disabled = false;
    }
});