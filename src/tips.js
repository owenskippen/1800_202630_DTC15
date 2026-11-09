import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";

const tipsContainer = document.querySelector(".tips-container");
const addTipForm = document.getElementById("addTipForm");
const tipTitle = document.getElementById("tipTitle");
const tipDescription = document.getElementById("tipDescription");
const tipMessage = document.getElementById("tipMessage");

async function getNextOrder() {
  const tipsSnapshot = await getDocs(
    query(
      collection(db, "tips"),
      orderBy("order", "desc")
    )
  );

  if (tipsSnapshot.empty) {
    return 1;
  }
  const highestTip = tipsSnapshot.docs[0].data();
  return highestTip.order + 1;
}


async function loadTips() {
  if (!tipsContainer) {
    return;
  }

  try {
    const tipsQuery = query(
      collection(db, "tips"),
      orderBy("order")
    );

    const tipsSnapshot = await getDocs(tipsQuery);

    console.log("Firestore tips loaded:", tipsSnapshot.size);
    tipsContainer.innerHTML = "";

    if (tipsSnapshot.empty) {
      return;
    }

    const user = auth.currentUser;

    tipsSnapshot.forEach(function (tipDoc) {
      const tip = tipDoc.data();
      const column = document.createElement("div");
      column.className = "col";

      const card = document.createElement("article");
      card.className = "tips-card card p-3 h-100";

      card.style.position = "relative";

      const title = document.createElement("h3");
      title.textContent =
        tip.order + ". " + tip.title;

      const description = document.createElement("p");
      description.textContent = tip.description;

      card.appendChild(title);
      card.appendChild(description);


      if (user && tip.userId === user.uid) {
        const deleteButton = document.createElement("button");

        deleteButton.className = "btn delete-button btn-sm position-absolute bottom-0 end-0 m-2";
        deleteButton.innerHTML = '<img src="https://img.icons8.com/?size=200&id=85081&format=png&color=000000" alt="Delete">';
        deleteButton.setAttribute(
          "aria-label",
          "Delete this tip"
        );
        deleteButton.addEventListener(
          "click",
          async function () {
            const currentUser = auth.currentUser;
            if (!currentUser ||
              tip.userId !== currentUser.uid) {

              console.log(
                "You cannot delete someone else's tip."
              );

              return;
            }

            const confirmed = confirm(
              "Are you sure you want to delete this tip?"
            );

            if (!confirmed) {
              return;
            }

            try {
              await deleteDoc(
                doc(db, "tips", tipDoc.id)
              );

              console.log("Tip deleted!");
              loadTips();

            } catch (error) {

              console.error(
                "Error deleting tip:",
                error
              );
            }
          }
        );

        card.appendChild(deleteButton);
      }
      column.appendChild(card);
      tipsContainer.appendChild(column);
    });

  } catch (error) {

    console.log(
      "Error loading tips:",
      error
    );
  }
}

addTipForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  const user = auth.currentUser;

  if (!user) {
    tipMessage.textContent =
      "You need to be logged in to add a tip.";
    tipMessage.className = "mt-3 text-danger";
    return;
  }


  const title = tipTitle.value.trim();
  const description = tipDescription.value.trim();


  if (title === "" || description === "") {
    tipMessage.textContent =
      "Please fill in both fields.";
    tipMessage.className = "mt-3 text-danger";
    return;
  }


  try {
    tipMessage.textContent =
      "Adding your tip...";

    await addDoc(collection(db, "tips"), {
      title: title,
      description: description,
      // Save the user who created the tip
      userId: user.uid,
      // Save when the tip was created
      createdAt: serverTimestamp(),
      // This will be used for sorting
      order: await getNextOrder()
    });

    tipMessage.textContent =
      "Your safety tip was added!";
    tipMessage.className = "mt-3 text-success";

    tipTitle.value = "";
    tipDescription.value = "";

    loadTips();
  } catch (error) {
    console.error("Error adding tip:", error);
    tipMessage.textContent =
      "There was an error adding your tip.";
    tipMessage.className = "mt-3 text-danger";
  }
});

loadTips();