import { auth, db } from "./firebase.js";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const form = document.getElementById("report-form");
const message = document.getElementById("report-status");
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  await auth.authStateReady();

  if (!auth.currentUser) {
    message.textContent = "Please log in first";
    return;
  }
  const url = document.getElementById("reportedURL").value;
  const type = document.getElementById("reportType").value;
  const description = document.getElementById("description").value;

  try {
    await addDoc(collection(db, "reports"), {
      userID: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      reportedURL: url,
      reportType: type,
      description: description,
      dateSubmitted: serverTimestamp(),
      status: "pending",
    });
    message.textContent = "Report submitted. Thank you for your feedback.";
    form.reset();
  } catch (error) {
    console.log(error);
    message.textContent = "something went wrong. Please try again later.";
  }
});
