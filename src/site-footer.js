class MainFooter extends HTMLElement {
  constructor() {
    super();
    this.renderFooter();
  }

  renderFooter() {
    this.innerHTML = `
            <!-- Footer: single source of truth -->
            <footer class="site-footer">
                <p>DTC15 Scam-Safety App &middot; COMP 1800, BCIT</p>
            </footer>
        `;
  }
}

customElements.define("site-footer", MainFooter);
