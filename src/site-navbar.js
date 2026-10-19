class MainNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
    }

    renderNavbar() {
        this.innerHTML = `
            <!-- Navbar: single source of truth -->
            <nav class="navbar shadow">
                <a href="#" class="navbar-brand">
                    <img src="./images/logo.jpg" alt="DTC15 logo" class="navbar-logo" />
                    DTC15
                </a>

                <ul class="navbar-links">
                    <li><a href="#" class="active">Home</a></li>
                    <li><a href="#">Scan a Link</a></li>
                    <li><a href="#">About</a></li>
                </ul>
            </nav>
        `;
    }
}

customElements.define('site-navbar', MainNavbar);
