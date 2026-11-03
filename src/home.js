import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
    // Accounts made before the users collection existed have no document yet
    const name = userDoc.exists() ? userDoc.data().name : user.displayName;

    if (name) {
      document.getElementById("userName").textContent = name;
    }
  });
}

document.addEventListener("DOMContentLoaded", setupHomeButtons);
showUserName();
