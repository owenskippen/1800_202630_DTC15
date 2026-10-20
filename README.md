# 1800_202630_DTC15 — Scam-Safety Web App

## Overview
Our team DTC15 is building a mobile-friendly web application that helps elderly people and children recognize and avoid online scams. The app gives real-time warnings, flags suspicious links, and offers simple safety guidance in plain language with large, easy-to-use controls.

The idea came from our course theme, *"Older and Wiser"*, and from our user survey: 75% of people said they were very confident at spotting scams, yet 50% had been scammed before, and 50% take no action when they receive a suspicious message.

Developed for the COMP 1800 course at BCIT, this project applies User-Centred Design practices and agile project management (Trello sprints), and uses Firebase for authentication, data storage, and hosting.

---


## Target Users
- **Older adults** who are less familiar with common online scam tactics.
- **Children** who are new to the internet, games, and online shopping.
- Family members who want an easy tool to share with them.

---


## Planned Features
- **Link scanner** – paste a suspicious link, message, or sender and get a Safe / Suspicious result with the reason.
- **Breach alerts** – find out if your email or password has appeared in a data breach, with step-by-step instructions to secure your account.
- **Scam reports** – report suspicious messages or sites, with screenshots, files, or links as evidence, so other users can be warned.
- **Alerts** – scam alerts and breach alerts in one place, with adjustable alert preferences.
- **Safety tips** – short, simple tips based on real scam types (fake shopping sites, game scams, money requests, urgent transfers, unknown senders).
- **History** – log in to see your previous scans, warnings, and alerts.

---


## Pages
| Page | File | Purpose | Status |
|------|------|---------|--------|
| Landing | `index.html` | Introduces the app | Done |
| Login / Sign up | `login.html` | Firebase Authentication | Layout done, auth in progress |
| Home | `main.html` | Dashboard with buttons to Check a link, Report a scam, Alerts, and Tips | Planned |
| Scanner | `scanner.html` | Check & Verify a link, message, or sender | Planned |
| Report | `report.html` | Report-a-scam form | Planned |
| Alerts | `alerts.html` | Scam alerts and breach alerts | Planned |
| Tips & Help | `tips.html` | Safety tips and support | Done |

*Status as of Sprint 1.*

---


## Technologies Used
- **Frontend**: HTML, CSS, JavaScript, [Bootstrap 5](https://getbootstrap.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase Authentication and Firebase Hosting
- **Database**: Cloud Firestore
- **Design & Planning**: Figma (wireframes), FigJam, Trello

---


## Usage
To run the application locally:

1. **Clone** the repository.
2. **Install dependencies** by running `npm install` in the project root directory.
3. **Start the development server** by running `npm run dev`.
4. Open your browser and visit the local address shown in your terminal (usually `http://localhost:5173`).

To build for production, run `npm run build`.

---


## Project Structure
```
1800_202630_DTC15/
├── src/
│   ├── main.js
│   └── site-navbar.js
├── styles/
│   ├── style.css
│   └── tips.css
├── images/
├── index.html
├── login.html
├── tips.html
├── skeleton.html
├── package.json
└── README.md
```

---


## Contributors
- Owen - BCIT CST Student with a passion for outdoor adventures and user-friendly applications. Fun fact: Loves solving Rubik's Cubes in under a minute.
- Alessio - BCIT CST Student, Frontend enthusiast with a knack for creative design. Fun fact: I have 20 cats.
- Verosika - BCIT CST Student, enjoys listening to various different genres of music and loves to take care of her cat and dog.

---


## Acknowledgments
- Scam examples and tips are based on our team's user survey and are for educational purposes only.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- UI components from [Bootstrap](https://getbootstrap.com/).

---


## Limitations and Future Work
### Limitations
- The link scanner uses simple rules (e.g. non-HTTPS links, IP addresses, URL shorteners, misspelled brand names) and cannot catch every scam.
- The app gives guidance only and is not a replacement for antivirus or official security advice.

### Future Work
- Connect the scanner to a real threat database for sender and link verification.
- Add short video tips (75% of our survey respondents preferred video).
- Track scam attempts over time and show trends.
- Improve accessibility (larger text options, screen reader support).

---


## License
This project is licensed under the MIT License.
