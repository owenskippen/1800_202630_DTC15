import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";


class MainNavbar extends HTMLElement {
  constructor() {
    super();
    this.renderNavbar();
  }

  connectedCallback() {
    this.renderNavbar();
  }

  renderNavbar() {
    this.innerHTML = `
            <!-- Navbar: single source of truth -->
            <!-- Bootstrap navbar: links collapse behind a menu button on small screens -->
            <nav class="navbar navbar-expand-lg navbar-dark shadow">
                <div class="container-fluid">
                    <div class="d-flex align-items-center gap-1">
                        <a href="./index.html" class="navbar-brand">
                            <img src="./images/logo.jpg" alt="DTC15 logo" class="navbar-logo" />
                            DTC15
                        </a>

                        <div id="greetingNav" class="text-bold " style="display: none; color: white;">
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
                            <li class="nav-item" id="loginNav"><a class="nav-link" href="./login.html" id="loginLogoutLink">Login</a></li>
                            <li class="nav-item"><a class="nav-link" href="./index.html">About</a></li>
                            <li class="nav-item"><a class="nav-link" href="./main.html">Home</a></li>
                            <li class="nav-item"><a class="nav-link" href="./scanner.html">Scan a Link</a></li>
                            <li class="nav-item"><a class="nav-link" href="./report.html">Report</a></li>
                            <li class="nav-item"><a class="nav-link" href="./alerts.html">Alerts</a></li>
                            <li class="nav-item"><a class="nav-link" href="./tips.html">Tips</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;

    const loginNav = this.querySelector("#loginNav");
    const loginLogoutLink = this.querySelector("#loginLogoutLink");
    const greetingNav = this.querySelector("#greetingNav");
    const userGreeting = this.querySelector("#userGreeting");

    // Handle clicking Login or Logout
    loginLogoutLink.addEventListener("click", async (event) => {
      if (auth.currentUser) {
        event.preventDefault();

        try {
          await signOut(auth);
          window.location.href = "./login.html";
        } catch (error) {
          console.error("Error signing out:", error);
          alert("Unable to log out. Please try again.");
        }
      }
    });

    // Update navbar when authentication status changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        let firstName = "there";

        if (user.displayName) {
          firstName = user.displayName.split(" ")[0];
        }

        userGreeting.textContent = "Hello " + firstName;

        loginLogoutLink.textContent = "Logout";
        loginLogoutLink.href = "#";

        greetingNav.style.display = "inline";
      } else {
        userGreeting.textContent = "";

        loginLogoutLink.textContent = "Login";
        loginLogoutLink.href = "./login.html";

        greetingNav.style.display = "none";
      }
    });

    // Highlight the current page
    this.highlightCurrentPage();
  }

  // Add the "active" class to the link for the page we are on
  highlightCurrentPage() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    this.querySelectorAll(".navbar-links a").forEach((link) => {
      if (link.getAttribute("href") === "./" + currentPage) {
        link.classList.add("active");
      }
    });
  }
}
customElements.define("site-navbar", MainNavbar);