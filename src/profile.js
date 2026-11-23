import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const alertSwitches = document.querySelectorAll(
  ".alert-settings .form-check-input",
);
const status = document.getElementById("alertSettingsStatus");

let alertPrefs = { scam: true, breach: true };

async function saveAlertPrefs(userId, alertSwitch) {
  const type = alertSwitch.dataset.alertType;

  alertPrefs[type] = alertSwitch.checked;
  status.textContent = "Saving...";
  try {
    await setDoc(
      doc(db, "users", userId),
      { alertPrefs: alertPrefs },
      { merge: true },
    );

    status.textContent = "Saved!";
  } catch (error) {
    console.error("Could not save alert settings:", error);

    alertSwitch.checked = !alertSwitch.checked;
    alertPrefs[type] = alertSwitch.checked;
    status.textContent =
      "Could not save your alert settings. Please try again.";
  }
}

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    status.textContent = "Please log in to manage your alert settings.";
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));

    const savedPrefs = userDoc.exists() ? userDoc.data().alertPrefs : null;

    alertPrefs = {
      scam: true,
      breach: true,
      ...(savedPrefs || {}),
    };

    alertSwitches.forEach(function (alertSwitch) {
      alertSwitch.checked = alertPrefs[alertSwitch.dataset.alertType];
      alertSwitch.disabled = false;

      alertSwitch.onchange = function () {
        saveAlertPrefs(user.uid, alertSwitch);
      };
    });
  } catch (error) {
    console.error("Could not load alert settings:", error);
    status.textContent =
      "Could not load your alert settings. Please try again.";
  }
});
