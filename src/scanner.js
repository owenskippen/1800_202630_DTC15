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
const scanStatus = document.getElementById("scanStatus");
const scanStatusLight = document.getElementById("scanStatusLight");
const scanStatusText = document.getElementById("scanStatusText");

// How often to ask VirusTotal if the scan is done.
// The free VirusTotal API only allows 4 requests per minute, so keep this at 15s or more.
const POLL_INTERVAL_MS = 15000;

// Give up automatic checking after this many tries (about 5 minutes)
const MAX_POLLS = 20;

// Timer for the background status check
let pollTimer = null;

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


// Update the status light and its text
// state is "scanning", "done", or "error"
function setScanStatus(state, text) {
    scanStatus.hidden = false;
    scanStatusLight.className = "scan-status-light " + state;
    scanStatusText.textContent = text;
}


// Stop any background status check that is running
function stopPolling() {
    if (pollTimer !== null) {
        clearTimeout(pollTimer);
        pollTimer = null;
    }
}


// Ask the server if the scan has finished, and keep asking until it has
async function pollScanStatus(analysisId, attempt) {

    // A new scan was started, so stop checking the old one
    if (analysisId !== currentAnalysisId) {
        return;
    }

    try {
        const response = await fetch(
            "/api/analysis/" + encodeURIComponent(analysisId)
        );
        const result = await response.json();

        if (analysisId !== currentAnalysisId) {
            return;
        }

        if (response.ok && result.status === "completed") {
            setScanStatus("done", "Scan complete! Your results are ready.");
            checkResultButton.disabled = false;
            checkResultButton.classList.add("results-ready");
            pollTimer = null;
            return;
        }
    } catch (error) {
        // Network hiccup, just try again on the next round
        console.error("Status check error:", error);
    }

    if (attempt + 1 >= MAX_POLLS) {
        setScanStatus(
            "error",
            "This scan is taking longer than usual. Try checking the results manually."
        );
        checkResultButton.disabled = false;
        pollTimer = null;
        return;
    }

    pollTimer = setTimeout(function () {
        pollScanStatus(analysisId, attempt + 1);
    }, POLL_INTERVAL_MS);
}


// Submit the URL to VirusTotal
scanButton.addEventListener("click", async function () {

    const url = linkInput.value.trim();

    if (url === "") {
        scanMessage.textContent = "Please enter a URL.";
        return;
    }

    // Reset the previous scan information
    stopPolling();
    currentAnalysisId = "";
    currentScannedUrl = url;
    scanSaved = false;

    scanMessage.textContent = "Submitting URL to VirusTotal...";
    scanResults.innerHTML = "";
    checkResultButton.hidden = true;
    checkResultButton.classList.remove("results-ready");
    scanStatus.hidden = true;
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

        scanMessage.textContent = "URL submitted!";

        // Show the button, but keep it disabled until the scan is done
        checkResultButton.hidden = false;
        checkResultButton.disabled = true;

        setScanStatus("scanning", "Scanning... this usually takes under a minute.");

        // Start checking in the background
        const analysisId = currentAnalysisId;
        pollTimer = setTimeout(function () {
            pollScanStatus(analysisId, 0);
        }, POLL_INTERVAL_MS);

    } catch (error) {
        console.error("Scanning error:", error);
        scanMessage.textContent = error.message;
        setScanStatus("error", "Could not start the scan.");

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
            setScanStatus("scanning", "Still scanning...");
            scanResults.textContent =
                "The scan is still processing. Please check again in a little while.";
            return;
        }

        // The scan is done, so no need to keep checking
        stopPolling();
        setScanStatus("done", "Scan complete!");
        checkResultButton.classList.remove("results-ready");

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