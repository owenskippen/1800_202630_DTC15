import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where
} from "firebase/firestore";
import { createScanItem } from "./scan-list.js";

// How many scans, alerts and breach checks to show under Recent Activity
const RECENT_SCAN_COUNT = 5;
const RECENT_ALERT_COUNT = 3;
const RECENT_BREACH_CHECK_COUNT = 5;
// Read extra alerts so there are still 3 to show after hiding the types a user turned off
const ALERT_FETCH_COUNT = 20;

// New users see both alert types until they change their settings
const DEFAULT_ALERT_PREFS = { scam: true, breach: true };

// Newest alerts from Firestore, and the user's current alert settings
let latestAlerts = [];
let alertPrefs = { ...DEFAULT_ALERT_PREFS };

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
    const name = data.firstName
      ? `${data.firstName} ${data.lastName}`.trim()
      : data.name || user.displayName;

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
        limit(RECENT_SCAN_COUNT),
      );
      const snapshot = await getDocs(scansQuery);

      // Keep the "No recent activity yet." message if nothing has been scanned
      if (snapshot.empty) return;

      const list = document.createElement("ul");
      list.className = "list-group";
      snapshot.forEach((scanDoc) =>
        list.append(createScanItem(scanDoc.data())),
      );

      recentActivity.replaceChildren(list);
    } catch (error) {
      console.error("Could not load recent scans:", error);
      recentActivity.innerHTML =
        "<p>Could not load your recent activity right now.</p>";
    }
  });
}

// Build one list row for an alert; the whole row links to the Alerts page
function createAlertItem(alert) {
  const item = document.createElement("a");
  item.href = "./alerts.html";
  item.className =
    "list-group-item list-group-item-action d-flex justify-content-between align-items-start gap-3";

  const details = document.createElement("div");

  // textContent keeps alert text as plain text, never as HTML
  const title = document.createElement("div");
  title.className = "fw-semibold";
  title.textContent = alert.title;

  const summary = document.createElement("small");
  summary.className = "text-muted";
  summary.textContent = alert.summary;

  details.append(title, summary);

  const isBreach = alert.type === "breach";
  const badge = document.createElement("span");
  badge.className =
    "badge rounded-pill " + (isBreach ? "text-bg-danger" : "text-bg-warning");
  badge.textContent = isBreach ? "Breach alert" : "Scam alert";

  item.append(details, badge);
  return item;
}

// List the newest alerts of the types the user has turned on
function renderRecentAlerts() {
  const recentAlerts = document.getElementById("recentAlerts");

  if (!alertPrefs.scam && !alertPrefs.breach) {
    recentAlerts.innerHTML =
      "<p>You have turned off all alerts. You can turn them back on in Profile.</p>";
    return;
  }

  const shownAlerts = latestAlerts
    .filter((alert) => alertPrefs[alert.type] !== false)
    .slice(0, RECENT_ALERT_COUNT);

  if (shownAlerts.length === 0) {
    recentAlerts.innerHTML = "<p>No alerts right now.</p>";
    return;
  }

  const list = document.createElement("div");
  list.className = "list-group";
  shownAlerts.forEach((alert) => list.append(createAlertItem(alert)));

  recentAlerts.replaceChildren(list);
}

// Load recent alerts based on the user's saved settings
function showAlertsAndSettings() {
  const recentAlerts = document.getElementById("recentAlerts");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const alertsQuery = query(
        collection(db, "alerts"),
        orderBy("createdAt", "desc"),
        limit(ALERT_FETCH_COUNT),
      );
      const [alertsSnapshot, userDoc] = await Promise.all([
        getDocs(alertsQuery),
        getDoc(doc(db, "users", user.uid)),
      ]);

      latestAlerts = alertsSnapshot.docs.map((alertDoc) => alertDoc.data());
      const savedPrefs = userDoc.exists() ? userDoc.data().alertPrefs : null;
      alertPrefs = { ...DEFAULT_ALERT_PREFS, ...savedPrefs };
    } catch (error) {
      console.error("Could not load alerts or alert settings:", error);
      recentAlerts.innerHTML = "<p>Could not load alerts right now.</p>";
      return;
    }

    renderRecentAlerts();
  });
}

// Build one list row for a breach check; the row links to the breach checker
function createBreachCheckItem(check) {
  const item = document.createElement("a");
  item.href = "./breaches.html";
  item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-start gap-3";

  const details = document.createElement("div");
  details.className = "text-break";

  // textContent keeps the email as plain text, never as HTML
  const email = document.createElement("div");
  email.className = "fw-semibold";
  email.textContent = check.email;

  const date = document.createElement("small");
  date.className = "text-muted";
  date.textContent = check.checkedAt ? "Checked " + check.checkedAt.toDate().toLocaleString() : "Checked just now";

  details.append(email, date);

  const count = check.breachCount ?? (check.breaches || []).length;
  const badge = document.createElement("span");
  badge.className = "badge rounded-pill " + (check.found ? "text-bg-danger" : "text-bg-success");
  badge.textContent = check.found ? `Found in ${count} breach${count === 1 ? "" : "es"}` : "No breaches found";

  item.append(details, badge);
  return item;
}

// Read the logged-in user's breach checks and list each email once, newest first
function showBreachChecks() {
  const recentBreachChecks = document.getElementById("recentBreachChecks");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      // Only this user's documents (the security rules require the userId filter)
      const checksQuery = query(collection(db, "breachHistory"), where("userId", "==", user.uid));
      const snapshot = await getDocs(checksQuery);

      // Keep only the newest check for each email, so older saved copies never show twice
      const newestByEmail = new Map();
      snapshot.forEach((checkDoc) => {
        const check = checkDoc.data();
        const email = (check.email || "").toLowerCase();
        const saved = newestByEmail.get(email);
        if (!saved || checkTime(check) > checkTime(saved)) {
          newestByEmail.set(email, check);
        }
      });

      const checks = [...newestByEmail.values()]
        .sort((a, b) => checkTime(b) - checkTime(a))
        .slice(0, RECENT_BREACH_CHECK_COUNT);

      // Keep the "You have not checked an email yet." message if there are no checks
      if (checks.length === 0) return;

      const list = document.createElement("div");
      list.className = "list-group";
      checks.forEach((check) => list.append(createBreachCheckItem(check)));

      recentBreachChecks.replaceChildren(list);
    } catch (error) {
      console.error("Could not load breach checks:", error);
      recentBreachChecks.innerHTML = "<p>Could not load your breach checks right now.</p>";
    }
  });
}

// When a breach check happened, in milliseconds (0 if the time is still being saved)
function checkTime(check) {
  return check.checkedAt ? check.checkedAt.toMillis() : 0;
}

document.addEventListener("DOMContentLoaded", setupHomeButtons);
showUserName();
showRecentScans();
showAlertsAndSettings();
showBreachChecks();
