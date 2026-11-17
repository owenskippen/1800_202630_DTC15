import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { createScanItem } from "./scan-list.js";

// Read every scan the logged-in user has saved and list them, newest first
function showScanHistory() {
  const scanHistory = document.getElementById("scanHistory");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      scanHistory.innerHTML = '<p>Please <a href="./login.html">log in</a> to see your scan history.</p>';
      return;
    }

    try {
      const scansQuery = query(
        collection(db, "users", user.uid, "scans"),
        orderBy("scanDate", "desc")
      );
      const snapshot = await getDocs(scansQuery);

      if (snapshot.empty) {
        scanHistory.innerHTML = "<p>You have not scanned any links yet.</p>";
        return;
      }

      const list = document.createElement("ul");
      list.className = "list-group";
      snapshot.forEach((scanDoc) => list.append(createScanItem(scanDoc.data())));

      scanHistory.replaceChildren(list);
    } catch (error) {
      console.error("Could not load scan history:", error);
      scanHistory.innerHTML = "<p>Could not load your scan history right now.</p>";
    }
  });
}

showScanHistory();
