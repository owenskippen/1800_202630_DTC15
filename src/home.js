import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { createScanItem } from "./scan-list.js";

// How many scans to show under Recent Activity
const RECENT_SCAN_COUNT = 5;

// Log which home button was clicked (the link still opens its page)
function setupHomeButtons() {
  document.querySelectorAll(".home-btn").forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Home button clicked: " + button.id);
    });
  });
}

// Read the logged-in user's name from the users collection and show it in the greeting
function showUserName() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    // New documents store firstName/lastName; older ones store name or have no document yet
    const data = userDoc.exists() ? userDoc.data() : {};
    const name = data.firstName ? `${data.firstName} ${data.lastName}`.trim() : (data.name || user.displayName);

    if (name) {
      document.getElementById("userName").textContent = name;
    }
  });
}

// Read the logged-in user's most recent scans and list them under Recent Activity
function showRecentScans() {
  const recentActivity = document.getElementById("recentActivity");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const scansQuery = query(
        collection(db, "users", user.uid, "scans"),
        orderBy("scanDate", "desc"),
        limit(RECENT_SCAN_COUNT)
      );
      const snapshot = await getDocs(scansQuery);

      // Keep the "No recent activity yet." message if nothing has been scanned
      if (snapshot.empty) return;

      const list = document.createElement("ul");
      list.className = "list-group";
      snapshot.forEach((scanDoc) => list.append(createScanItem(scanDoc.data())));

      recentActivity.replaceChildren(list);
    } catch (error) {
      console.error("Could not load recent scans:", error);
      recentActivity.innerHTML = "<p>Could not load your recent activity right now.</p>";
    }
  });
}

document.addEventListener("DOMContentLoaded", setupHomeButtons);
showUserName();
showRecentScans();
