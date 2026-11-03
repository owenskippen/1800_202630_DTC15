import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

// Get the elements from the scanner page
const linkInput = document.getElementById("linkInput");
const scanButton = document.getElementById("scanButton");
const scanMessage = document.getElementById("scanMessage");
const checkResultButton = document.getElementById("checkResultButton");
const scanResults = document.getElementById("scanResults");

// Store the analysis ID
let currentAnalysisId = "";

// Store the URL that was submitted
let currentScannedUrl = "";

// Check if the scan has already been saved
let scanSaved = false;


// Wait until Firebase finishes checking the user's login
function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}


// Submit the URL to VirusTotal
scanButton.addEventListener("click", async function () {

    const url = linkInput.value.trim();

    if (url === "") {
        scanMessage.textContent = "Please enter a URL.";
        return;
    }

    // Reset the previous scan information
    currentAnalysisId = "";
    currentScannedUrl = url;
    scanSaved = false;

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

        // Get the currently logged-in user
        const user = await getCurrentUser();

        // Only save scans for logged-in users
        if (user && !scanSaved) {
            try {
                // Get the user's scans collection
                const scansCollection = collection(
                    db,
                    "users",
                    user.uid,
                    "scans"
                );

                // Save the scan information
                const docRef = await addDoc(scansCollection, {
                    url: currentScannedUrl,
                    scanDate: serverTimestamp(),
                    malicious: malicious,
                    suspicious: suspicious,
                    harmless: harmless,
                    undetected: undetected,
                    analysisID: currentAnalysisId
                });

                console.log("Scan saved to Firestore:", docRef.id);

                scanSaved = true;

                scanMessage.textContent =
                    "Scan completed and saved to your scan history!";

            } catch (error) {
                console.error("Error saving scan:", error);

                scanMessage.textContent =
                    "Scan completed, but could not save it to your history: "
                    + error.message;
            }

        } else if (!user) {
            scanMessage.textContent =
                "Scan completed, but you must be logged in to save your scan.";
        }

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