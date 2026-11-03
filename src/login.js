import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from "firebase/auth";

import {
    doc,
    setDoc,
    getDoc, 
    serverTimestamp
} from "firebase/firestore";

let isSubmittingAuth = false;
const loginView = document.getElementById("loginView");
const signupView = document.getElementById("signupView");
const MAIN_PAGE = "./main.html";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const authMessage = document.getElementById("authMessage");

onAuthStateChanged(auth, function (user) {
    if (user && !isSubmittingAuth) {
        window.location.replace(MAIN_PAGE);
    }
});

document.getElementById("toSignup").addEventListener("click", function (event) {
    event.preventDefault();

    loginView.classList.add("d-none");
    signupView.classList.remove("d-none");

    authMessage.textContent = "";
});

// Switch to login
document.getElementById("toLogin").addEventListener("click", function (event) {
    event.preventDefault();

    signupView.classList.add("d-none");
    loginView.classList.remove("d-none");

    authMessage.textContent = "";
});

// Create a new account
signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    isSubmittingAuth = true;
    const firstName = document.getElementById("signupFirstName").value.trim();
    const lastName = document.getElementById("signupLastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    authMessage.textContent = "";

    try {
        // Create the Firebase account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );



        await updateProfile(userCredential.user, {
            displayName: firstName + " " + lastName
        });

        await checkUserInFirestore(userCredential.user);

        window.location.replace(MAIN_PAGE);


    } catch (error) {
        console.error(error);
        isSubmittingAuth = false;
        authMessage.textContent = error.message;
        authMessage.className = "text-center mt-3 text-danger";
    }
});

async function checkUserInFirestore(user) {
    console.log("Checking Firestore for user:", user.uid);

    const userRef = doc(db, "users", user.uid);

    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        console.log("User does not exist. Creating document...");

        await setDoc(userRef, {
            firstName: user.displayName ? user.displayName.split(" ")[0] : "",
            lastName: user.displayName ? user.displayName.split(" ").slice(1).join(" ") : "",
            email: user.email,
            createdAt: serverTimestamp()
        });

        console.log("User successfully added to Firestore!");
    } else {
        console.log("User already exists in Firestore.");
    }
}

// Log in to an existing account
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    isSubmittingAuth = true;
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    authMessage.textContent = "";

    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        await checkUserInFirestore(userCredential.user);

        window.location.replace(MAIN_PAGE);


    } catch (error) {
        console.error(error);
        isSubmittingAuth = false;
        authMessage.textContent = error.message;
        authMessage.className = "text-center mt-3 text-danger";
    }
});


// Display readable error messages
function getErrorMessage(errorCode) {
    if (errorCode === "auth/email-already-in-use") {
        return "An account with this email already exists.";
    }

    if (errorCode === "auth/invalid-email") {
        return "Please enter a valid email address.";
    }

    if (errorCode === "auth/weak-password") {
        return "Your password is too short. Use at least 6 characters.";
    }

    if (
        errorCode === "auth/invalid-credential" ||
        errorCode === "auth/user-not-found" ||
        errorCode === "auth/wrong-password"
    ) {
        return "Incorrect email or password.";
    }

    return "Something went wrong. Please try again.";
}
