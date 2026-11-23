import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

class BackButton extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.renderButton();

        // Check whether the user is signed in
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.style.display = "block";
            } else {
                this.style.display = "none";
            }
        });
    }

    renderButton() {
        this.innerHTML = `
            <div class="container-fluid">
                <a href="./main.html" class="btn btn-outline-primary shadow-sm">
                    < Back to Home
                </a>
            </div>
        `;
    }
}

customElements.define("back-button", BackButton);
