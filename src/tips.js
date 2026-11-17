import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";


// Get the elements from the page
const officialTipsContainer = document.getElementById("officialTipsContainer");
const userTipsContainer = document.getElementById("userTipsContainer");

const addTipForm = document.getElementById("addTipForm");
const tipTitle = document.getElementById("tipTitle");
const tipDescription = document.getElementById("tipDescription");
const tipMessage = document.getElementById("tipMessage");


// Load all tips from Firestore
async function loadTips() {

  try {

    // Get all documents from the tips collection
    const tipsSnapshot = await getDocs(collection(db, "tips"));

    console.log("Firestore tips loaded:", tipsSnapshot.size);


    // Clear both sections
    officialTipsContainer.innerHTML = "";
    userTipsContainer.innerHTML = "";


    // Store the official and user tips separately
    const officialTips = [];
    const userTips = [];


    // Go through every tip
    tipsSnapshot.forEach(function (tipDoc) {

      const tip = tipDoc.data();

      // Check if the tip has a userId
      if (tip.userId) {

        // This is a user-submitted tip
        userTips.push(tipDoc);

      } else {

        // This is an official tip
        officialTips.push(tipDoc);

      }

    });


    // Sort official tips using their order number
    officialTips.sort(function (a, b) {

      return (a.data().order || 0) - (b.data().order || 0);

    });


    // Sort user tips by newest first
    userTips.sort(function (a, b) {

      const dateA = a.data().createdAt?.toMillis() || 0;
      const dateB = b.data().createdAt?.toMillis() || 0;

      return dateB - dateA;

    });


    // Get the currently logged-in user
    const user = auth.currentUser;


    // Display the official tips
    officialTips.forEach(function (tipDoc) {

      displayTip(tipDoc, officialTipsContainer, user);

    });


    // Display the user-submitted tips
    userTips.forEach(function (tipDoc) {

      displayTip(tipDoc, userTipsContainer, user);

    });


    // Show a message if there are no official tips
    if (officialTips.length === 0) {

      officialTipsContainer.innerHTML =
        "<p>No official tips available.</p>";

    }


    // Show a message if there are no user tips
    if (userTips.length === 0) {

      userTipsContainer.innerHTML =
        "<p>No user tips have been submitted yet.</p>";

    }

  } catch (error) {

    console.log("Error loading tips:", error);

  }

}


// Create and display an individual tip card
function displayTip(tipDoc, container, user) {

  const tip = tipDoc.data();


  // Create the Bootstrap column
  const column = document.createElement("div");

  column.className = "col";


  // Create the card
  const card = document.createElement("article");

  card.className = "tips-card card p-3 h-100";

  card.style.position = "relative";


  // Create the title
  const title = document.createElement("h3");

  title.textContent = tip.title;


  // Create the description
  const description = document.createElement("p");

  description.textContent = tip.description;


  card.appendChild(title);
  card.appendChild(description);


  // Only show the delete button on the current user's tips
  if (user && tip.userId === user.uid) {

    const deleteButton = document.createElement("button");

    deleteButton.className =
      "btn delete-button btn-sm position-absolute bottom-0 end-0 m-2";

    deleteButton.innerHTML =
      '<img src="https://img.icons8.com/?size=200&id=85081&format=png&color=000000" alt="Delete">';

    deleteButton.setAttribute(
      "aria-label",
      "Delete this tip"
    );


    // Delete the tip when the button is clicked
    deleteButton.addEventListener("click", async function () {

      const currentUser = auth.currentUser;


      // Make sure the user still owns this tip
      if (!currentUser || tip.userId !== currentUser.uid) {

        console.log("You cannot delete someone else's tip.");

        return;
      }


      const confirmed = confirm(
        "Are you sure you want to delete this tip?"
      );

      if (!confirmed) {
        return;
      }


      try {

        // Delete the tip from Firestore
        await deleteDoc(
          doc(db, "tips", tipDoc.id)
        );

        console.log("Tip deleted!");


        // Reload both sections
        loadTips();

      } catch (error) {

        console.error("Error deleting tip:", error);

      }

    });


    card.appendChild(deleteButton);

  }


  // Add the card to the page
  column.appendChild(card);

  container.appendChild(column);

}


// Add a new tip
addTipForm.addEventListener("submit", async function (event) {

  event.preventDefault();


  // Get the currently logged-in user
  const user = auth.currentUser;


  if (!user) {

    tipMessage.textContent =
      "You need to be logged in to add a tip.";

    tipMessage.className = "mt-3 text-danger";

    return;
  }


  // Get the user's input
  const title = tipTitle.value.trim();

  const description = tipDescription.value.trim();


  if (title === "" || description === "") {

    tipMessage.textContent =
      "Please fill in both fields.";

    tipMessage.className = "mt-3 text-danger";

    return;
  }


  try {

    tipMessage.textContent = "Adding your tip...";


    // Save the new tip to Firestore
    await addDoc(collection(db, "tips"), {

      title: title,

      description: description,

      // Save the user who created the tip
      userId: user.uid,

      // Save when the tip was created
      createdAt: serverTimestamp()

    });


    tipMessage.textContent =
      "Your safety tip was added!";

    tipMessage.className = "mt-3 text-success";


    // Clear the form
    tipTitle.value = "";
    tipDescription.value = "";


    // Reload the tips
    loadTips();

  } catch (error) {

    console.error("Error adding tip:", error);

    tipMessage.textContent =
      "There was an error adding your tip.";

    tipMessage.className = "mt-3 text-danger";

  }

});


// Load tips when Firebase finishes checking the login status
onAuthStateChanged(auth, function () {

  loadTips();

});