<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=300&color=gradient&text=Pixel%20Phantoms&desc=From%20Students,%20%20For%20Students&descAlign=49&descAlignY=51&fontAlignY=36"/>
</p>

<h2 align='center'><b>Pixel Phantoms Official Website</b> is a <i>beginner-friendly, responsive, open-source</i> community</h2>

![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen)   
![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)

The project aims to,

- Showcase the **Pixel Phantoms community**
- Display **events, workshops, achievements, and projects**
- Introduce the **core committee**
- Provide **contact & recruitment** sections
- Serve as a platform for students to **learn and contribute**

> This repository welcomes **students, beginners, and open-source contributors**.

---

## Table of Contents
- [Why This Project Matters](#-why-this-project-matters)
- [Tech Stack](#-tech-stack)
- [How to Install & Run Locally](#-how-to-install--run-locally)
- [Code Formatting & Linting](#code-formatting--linting)
- [How to Contribute](#-how-to-contribute)
- [Project Structure](#--project-structure)
- [Screenshot / Demo](#--screenshot--demo)
- [Project Roadmap](#%EF%B8%8F-project-roadmap)
- [Issues](#-issues)
- [License](#-license)
- [Core Committee — 2024–25](#%E2%80%8D-core-committee)
- [Contributors](#-contributors)
- [Contact](#-contact)

---

## 🌟 Why This Project Matters

- Beginner-friendly for first-time contributors  
- Helps students learn **frontend development**  
- Encourages open-source collaboration  
- Real-world project structure and components  
- Great for improving UI/UX, layout, and responsiveness  
---

## 🛠 Tech Stack

**Frontend:** <img width='20px' src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" /> HTML5 / 
            <img width='20px' src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" /> CSS3 / 
            <img width='20px' src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" />JavaScript

**Optional Add-ons:** Bootstrap / AOS Animations / jQuery / API Integrations

---

## 📦 How to Install & Run Locally

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for cloning the repository)
- Optional: VS Code with Live Server extension for better development experience

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/pixel-phantoms-website.git
cd pixel-phantoms-website
```

### 2️⃣ Run the Website

You can:

* **Option 1:** Open `index.html` directly in your browser by double-clicking the file or dragging it into the browser window.
  OR
* **Option 2:** Use **Live Server** (Recommended for development):
  - Install the Live Server extension in VS Code.
  - Right-click on `index.html` in the file explorer.
  - Select **"Open with Live Server"**.

The website will open in your default browser at `http://127.0.0.1:5500/` (or similar local server address).

---
# 🔧 Code Formatting & Linting

This project uses Prettier and ESLint to ensure consistent code style.

### Setup

After cloning the repository, install dependencies:
``` bash
npm install
```
This will also set up Git hooks automatically (via Husky).

#### Formatting (Prettier)

Format all supported files (.js, .css, and .html)
```bash
npm run format
```

#### Check formatting (no changes)

Useful to verify formatting before committing.
```bash
npm run format:check
```

#### Linting (ESLint)

Run lint checks
```bash
npm run lint
```
* Reports potential issues and warnings
* Does not modify files

#### Auto-fix safe issues

```bash
npm run lint:fix
```
Fixes only safe, auto-fixable issues (e.g. spacing, syntax)

#### Pre-commit Hooks

This project uses Husky and lint-staged to enforce formatting and linting before every commit.

* Only staged files are checked
* JavaScript files:
   - ESLint (--fix)
   - Prettier
* HTML & CSS files:
   - Prettier

If checks fail → the commit is blocked

---

## 🤝 How to Contribute

We welcome **all contributions** — design updates, animations, UI fixes, new pages, and more.

### ✔ Before you start:

* Create an **Issue**
* Wait for the admin to **assign** it
* Start contributing 🚀

### 📌 Contribution Steps

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/pixel-phantoms-website.git
   ```
3. Create a feature branch:

   ```bash
   git checkout -b feature-name
   ```
4. Commit your work:

   ```bash
   git commit -m "Add: short feature description"
   ```
5. Push your branch:

   ```bash
   git push origin feature-name
   ```
6. Submit a Pull Request 🎉

👉 Detailed contribution guidelines -> [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

<details>

<summary>
  <h2> 📁 Project Structure</h2>
  <p>Click to view the project structure</p>
</summary>


```
pixel-phantoms-website/
│
├── index.html
├── about.html
├── contact.html
├── team.html
├── events.html
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
│
├── assets/
│   ├── demo.png
│   ├── host-event.jpg
│   └── logo.png
│
├── css/
│   ├── style.css
│   ├── home-gsap.css
│   ├── back-to-top.css
│   ├── community.css
│   ├── contact.css
│   ├── contributors.css
│   ├── events.css
│   ├── gallery.css
│   ├── help.css
│   ├── join-us.css
│   ├── privacy.css
│   ├── projects.css
│   └── terms.css
│
├── data/
│   └── events.json
│
├── js/
│   ├── back-to-top.js
│   ├── community.js
│   ├── contact.js
│   ├── contributors.js
│   ├── events.js
│   ├── footer.js
│   ├── gallery.js
│   ├── help.js
│   ├── home-gsap.js
│   ├── home-leaderboard.js
│   ├── join-us.js
│   ├── main.js
│   ├── navbar.js
│   ├── privacy.js
│   ├── projects.js
│   ├── scripts.js
│   ├── terms.js
│   └── theme.js
│
└── pages/
    ├── community.html
    ├── contributors.html
    ├── gallery.html
    ├── help.html
    ├── join-us.html
    ├── privacy.html
    ├── projects.html
    └── terms.html
```
</details>

<details>
<summary>
  <h2> 🎨 Screenshot / Demo</h2>
  <p>Click to view screenshots of the Pixel Phantoms website</p>
</summary>

### Home Page
<img src='assets/demo.png'/>

### Logo
<img width='350px' src='assets/logo.png'/>

### Host Event
<img width='450px' src='assets/host-event.jpg'/>

</details>

---

## 🗺️ Project Roadmap

✅ Completed |🚧 In Progress |🔮 Coming Soon
|---|---|---|
Basic UI setup | Events Page | Dark / Light mode
Home, About, Contact pages | Projects showcase | Blog section
Core committee section | Mobile responsiveness improvements | Student portfolio integration
Navbar & footer components| |

---

## 📝 Issues

Found a bug?
Have an idea?
👉 Open an **Issue** with the correct labels.

---

## 📌 License

This project is licensed under the **MIT License**.
See the full license in the [`LICENSE`](LICENSE) file.

---
<details>

<summary>
  <h2>🧑‍💻 Core Committee</h2>
  <p>Click to view the committee for the batch 2024-25</p>
</summary>

* **Director:** Prathamesh Wamane
* **President:** Krishna Shimpi
* **Vice President:** Pratik Thorat
* **Technical Head:** Harsh Pawar
* **Treasurer:** Ayush Patil
* **Event Head:** Laxmi Shingne
* **Project Manager:** Krushna Gite
* **Recruitment Head:** Pallavi Thote
* **Web Development Lead:** Pushkar Thakare
* **Design Head:** Shruti Gaikwad
* **Embedded System Lead:** Diksha Rakibe
* **Social Media & Branding Head:** Rushabh Pekhale
* **Media & Publicity Head:** Sarvesh Aher
* **Mentors:** Sayee Gosavi, Mohit Jagtap

</details>

---

## 🔥 Contributors

Thanks to all the amazing contributors who make this project better every day! 💖

<a href="https://github.com/sayeeg-11/Pixel_Phantoms/graphs/contributors">
  <img width="550px" src="https://contrib.rocks/image?repo=sayeeg-11/Pixel_Phantoms" />
</a>

**👉 See the full [contribution graph](https://github.com/sayeeg-11/Pixel_Phantoms/graphs/contributors)**  



---

## 📫 Contact

**Admin:**
 **Sayee Gosavi**
- 📧 [sayeeygosavi@gmail.com](mailto:sayeeygosavi@gmail.com)
- 📍 Nashik, Maharashtra

> Let’s build something amazing together! 🚀👻


