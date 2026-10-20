class MainNavbar extends HTMLElement {
  constructor() {
    super();
    this.renderNavbar();
  }

  renderNavbar() {
    this.innerHTML = `
            <!-- Navbar: single source of truth -->
            <nav class="navbar shadow">
                <a href="./index.html" class="navbar-brand">
                    <img src="./images/logo.jpg" alt="DTC15 logo" class="navbar-logo" />
                    DTC15
                </a>

                <ul class="navbar-links">
                    <li><a href="./main.html">Home</a></li>
                    <li><a href="./scanner.html">Scan a Link</a></li>
                    <li><a href="./report.html">Report</a></li>
                    <li><a href="./alerts.html">Alerts</a></li>
                    <li><a href="./tips.html">Tips</a></li>
                    <li><a href="./index.html">About</a></li>
                    <li><a href="./login.html">Login</a></li>
                </ul>
            </nav>
        `;
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
