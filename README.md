# 🍔 Foodie Express - Premium Food Delivery App

**Foodie Express** is a fully functional, feature-rich, and highly interactive web application. It offers a seamless food ordering experience with a focus on modern UI/UX and engaging user features.

## 🚀 Live Demo
You can view the live project here:  
👉 [https://arpitach64.github.io/foodie-express/](https://arpitach64.github.io/foodie-express/)

## ✨ Key Features

* **🎙️ Voice Search:** Utilizes the Google Speech-to-Text API for a hands-free food searching experience.
* **🌓 Adaptive Dark Mode:** Automatically switches between light and dark themes based on user preference or system settings.
* **💎 Gamification System:**
    * **Virtual Wallet:** Every guest user starts with an initial balance of **$50.00**.
    * **Points System:** Users earn reward points for every order placed and for subscribing to the newsletter.
* **📄 PDF Invoicing:** Automatically generates and downloads a professional receipt using the `jsPDF` library upon order completion.
* **🛒 Advanced Cart:** Features real-time multi-item quantity management and smooth slide-out removal animations.
* **❤️ Smart Wishlist:** Allows users to favorite items and add them to the cart with custom quantities directly from the wishlist.
* **📍 Location Detection:** Integrates the OpenStreetMap API to automatically fetch the user’s live delivery address.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (using Custom Variables & Keyframes for smooth animations).
* **Logic:** Vanilla JavaScript (ES6+).
* **Libraries:** * [Swiper.js](https://swiperjs.com/) - For touch-enabled product sliders.
    * [jsPDF](https://github.com/parallax/jsPDF) - For dynamic PDF generation.
    * [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) - For celebration effects during checkout.

## 📂 Project Structure

* `index.html` – The core structure and layout of the app.
* `style.css` – Custom styling, responsive design, and dark mode implementation.
* `main.js` – Application logic, including cart functionality and API integrations.
* `products.json` – The data store for all menu items and ingredients.
* `/images` – Optimized assets for food items and UI elements.
* `/sounds` – Interactive audio feedback for user actions.

## ⚙️ How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Arpitach64/foodie-express.git](https://github.com/Arpitach64/foodie-express.git)
    ```
2.  **Note:** This project uses the `fetch()` API to load data. For security reasons, it will not run by simply opening the HTML file in a browser.
3.  **Run with a Server:** Use the **Live Server** extension in VS Code to launch the project at `http://localhost:5500`.

---
Developed with ❤️ by [Arpitach64](https://github.com/Arpitach64)
