import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

// DTC15 Firebase configuration
// Replace these values with the real Firebase web app config.
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhtoYIT9V04g0ZKMB2Lgdbw4wMyK5MO_s",
  authDomain: "dtc15-project.firebaseapp.com",
  projectId: "dtc15-project",
  storageBucket: "dtc15-project.firebasestorage.app",
  messagingSenderId: "210676356353",
  appId: "1:210676356353:web:61104ea932913d45833700",
  measurementId: "G-KW7HRME9YF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadTips() {
  const tipsContainer = document.querySelector(".tips-container");

  if (!tipsContainer) {
    return;
  }

  try {
    const tipsQuery = query(collection(db, "tips"), orderBy("order"));

    const tipsSnapshot = await getDocs(tipsQuery);
    console.log("Firestore tips loaded:", tipsSnapshot.size);

    if (tipsSnapshot.empty) {
      return;
    }

    // Replace the example cards with Firestore data
    tipsContainer.innerHTML = "";

    tipsSnapshot.forEach(function (tipDoc) {
      const tip = tipDoc.data();

      const card = document.createElement("article");
      card.className = "tips-card card p-3 flex-fill";
      card.style.width = "250px";

      const title = document.createElement("h3");
      title.textContent = tip.order + ". " + tip.title;

      const description = document.createElement("p");
      description.textContent = tip.description;

      card.appendChild(title);
      card.appendChild(description);

      tipsContainer.appendChild(card);
    });
  } catch (error) {
    console.log("Error loading tips:", error);
  }
}

loadTips();
