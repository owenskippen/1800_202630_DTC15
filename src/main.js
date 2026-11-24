import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// If you have custom global styles, import them as well:
import '../styles/style.css';

import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
    const returnHomeContainer = document.querySelector("#returnHomeContainer");

    if (returnHomeContainer) {
        if (user) {
            returnHomeContainer.style.display = "block";
        } else {
            returnHomeContainer.style.display = "none";
        }
    }
});