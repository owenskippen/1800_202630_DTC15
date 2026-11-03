import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

// Send users to login if they are not signed in
onAuthStateChanged(auth, function (user) {
    if (!user) {
        window.location.replace("./login.html");
    } else {
        console.log("Logged in as:", user.email);

        // Make the user's information available to this page
        document.dispatchEvent(
            new CustomEvent("userLoggedIn", {
                detail: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }
            })
        );
    }
});
