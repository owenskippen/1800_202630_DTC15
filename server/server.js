import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// This route receives a URL from the website
app.post("/api/scan", async (req, res) => {
    const url = req.body.url;

    // Make sure a URL was provided
    if (!url || typeof url !== "string") {
        return res.status(400).json({
            error: "Please enter a URL."
        });
    }

    // Check if the URL is valid
    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch {
        return res.status(400).json({
            error: "Please enter a valid URL."
        });
    }

    // Only allow website URLs
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).json({
            error: "Only HTTP and HTTPS URLs are supported."
        });
    }

    // Get the API key from the .env file
    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "VirusTotal API key is missing."
        });
    }

    try {
        // Prepare the URL for VirusTotal
        const formData = new URLSearchParams();
        formData.append("url", parsedUrl.toString());

        // Send the URL to VirusTotal
        const response = await fetch(
            "https://www.virustotal.com/api/v3/urls",
            {
                method: "POST",
                headers: {
                    "x-apikey": apiKey,
                    "accept": "application/json",
                    "content-type": "application/x-www-form-urlencoded"
                },
                body: formData
            }
        );

        const result = await response.json();

        // Check if VirusTotal returned an error
        if (!response.ok) {
            return res.status(response.status).json({
                error: result.error?.message || "VirusTotal request failed."
            });
        }

        // Send the analysis ID back to the website
        res.json({
            analysisId: result.data.id
        });

    } catch (error) {
        console.error("Error scanning URL:", error);

        res.status(500).json({
            error: "Something went wrong while scanning the URL."
        });
    }
});

// Get the results of a URL scan
app.get("/api/analysis/:id", async (req, res) => {

    const analysisId = req.params.id;
    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "VirusTotal API key is missing."
        });
    }

    try {
        const response = await fetch(
            `https://www.virustotal.com/api/v3/analyses/${encodeURIComponent(analysisId)}`,
            {
                method: "GET",
                headers: {
                    "x-apikey": apiKey,
                    "accept": "application/json"
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: result.error?.message || "Could not retrieve scan results."
            });
        }

        // Return the scan status and statistics
        res.json({
            status: result.data.attributes.status,
            stats: result.data.attributes.stats
        });

    } catch (error) {
        console.error("Error getting analysis:", error);

        res.status(500).json({
            error: "Something went wrong retrieving the results."
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});