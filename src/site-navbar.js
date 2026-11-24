
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

class MainNavbar extends HTMLElement {
  connectedCallback() {
    this.renderNavbar();
  }

  renderNavbar() {
    this.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark shadow">
                <div class="container-fluid">
                    <div class="d-flex align-items-center gap-1">
                        <a href="./index.html" class="navbar-brand" id="brandLink">
                            <img src="./images/logo.jpg" alt="DTC15 logo" class="navbar-logo" />
                            DTC15
                        </a>

                        <div id="greetingNav" style="display: none; color: white;">
                            <span id="userGreeting"></span>
                        </div>
                    </div>

                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#mainNavLinks" aria-controls="mainNavLinks"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="mainNavLinks">
                        <ul class="navbar-nav navbar-links ms-auto">

                            <li class="nav-item" id="loginNav">
                                <a class="nav-link" href="./login.html" id="loginLogoutLink">Login</a>
                            </li>

                            <li class="nav-item" id="aboutNav">
                                <a class="nav-link" href="./index.html">About</a>
                            </li>

                            <li class="nav-item" id="homeNav">
                                <a class="nav-link" href="./main.html">Home</a>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link" href="./scanner.html">Scan a Link</a>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link" href="./report.html">Report</a>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link" href="./breaches.html">Breach Scanner</a>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link" href="./tips.html">Tips</a>
                            </li>

                            <li class="nav-item" id="profileNav">
                              <a class="nav-link" href="./profile.html">Profile</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;

    const loginLogoutLink = this.querySelector("#loginLogoutLink");
    const greetingNav = this.querySelector("#greetingNav");
    const userGreeting = this.querySelector("#userGreeting");
    const aboutNav = this.querySelector("#aboutNav");
    const homeNav = this.querySelector("#homeNav");
    const brandLink = this.querySelector("#brandLink");
    const profileNav = this.querySelector("#profileNav");

    // Handle clicking Login or Logout
    loginLogoutLink.addEventListener("click", async (event) => {
      if (auth.currentUser) {
        event.preventDefault();

        try {
          await signOut(auth);
          window.location.href = "./index.html";
        } catch (error) {
          console.error("Error signing out:", error);
          alert("Unable to log out. Please try again.");
        }
      }
    });

    // Update navbar when authentication status changes
    onAuthStateChanged(auth, (user) => {
      const currentPage = window.location.pathname.split("/").pop() || "index.html";

      if (user) {
        // User is signed in
        let firstName = "there";

        if (user.displayName) {
          firstName = user.displayName.split(" ")[0];
        }

        userGreeting.textContent = "Hello " + firstName;

        loginLogoutLink.textContent = "Logout";
        loginLogoutLink.href = "#";

        greetingNav.style.display = "inline";

        // Show Home and hide About
        homeNav.classList.remove("d-none");
        profileNav.classList.remove("d-none");
        aboutNav.classList.add("d-none");

        // Logo takes user to Home
        brandLink.href = "./main.html";

        // Signed-in users should not access the About page
        if (currentPage === "index.html") {
          window.location.href = "./main.html";
        }

      } else {
        // User is signed out
        userGreeting.textContent = "";

        loginLogoutLink.textContent = "Login";
        loginLogoutLink.href = "./login.html";

        greetingNav.style.display = "none";

        // Show About and hide Home
        aboutNav.classList.remove("d-none");
        homeNav.classList.add("d-none");
        profileNav.classList.add("d-none");

        // Logo takes user to About
        brandLink.href = "./index.html";

        // Signed-out users should not access Home
        if (currentPage === "main.html") {
          window.location.href = "./index.html";
        }
      }

      this.highlightCurrentPage();
    });
  }

  // Highlight the current page
  highlightCurrentPage() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    this.querySelectorAll(".navbar-links a").forEach((link) => {
      if (link.getAttribute("href") === "./" + currentPage) {
        link.classList.add("active");
      }
    });
  }
}

customElements.define("site-navbar", MainNavbar);