// =============================================
// STATE
// =============================================
let wishlist = JSON.parse(localStorage.getItem("foodie_wishlist")) || [];
let recentlyViewed = JSON.parse(localStorage.getItem("foodie_recently_viewed")) || [];
let currentPoints = parseInt(localStorage.getItem("guest_points")) || 120;
let walletBalance = parseFloat(localStorage.getItem("guest_wallet")) || 50.00;
let productlist = [];
let cartProduct = [];
let currentFilter = "All";
let searchQuery = "";
let sortType = "default";
let maxPrice = 25;
let minRating = 0;
let discountPercent = 0;
let appliedPromo = "";
let isLoginMode = true;
// F8: track if first-ever wishlist item
let neverWishlisted = !localStorage.getItem("foodie_wishlist");

// =============================================
// SOUND
// =============================================
const playSound = (type) => {
    const map = { add: "sounds/add.mp3", success: "sounds/success.mp3", remove: "sounds/remove.mp3" };
    const a = new Audio(map[type]);
    a.volume = 0.5;
    a.play().catch(() => { });
};

// =============================================
// SWIPER
// =============================================
const initSwiper = () => {
    new Swiper(".mySwiper", {
        loop: true,
        navigation: { nextEl: "#next", prevEl: "#prev" },
        breakpoints: { 768: { slidesPerView: 1 } }
    });
};

// =============================================
// SELECTORS
// =============================================
const cartIcon = document.querySelector(".cart-icon");
const cartTab = document.querySelector(".cart-tab");
const closeBtn = document.querySelector(".close-btn");
const clearBtn = document.querySelector(".clear-btn");
const cardList = document.querySelector(".card-list");
const cartList = document.querySelector(".cart-list");
const cartTotal = document.querySelector(".cart-total");
const cartValue = document.querySelector(".cart-value");
const bars = document.querySelector(".bars");
const mobileMenu = document.querySelector(".mobile-menu");
const filterBtns = document.querySelectorAll(".filter-buttons button");
const searchBar = document.getElementById("search-bar");
const sortOptions = document.getElementById("sort-options");
const themeBtn = document.getElementById("theme-btn");

const getPrice = (p) => typeof p === "number" ? p : parseFloat(String(p).replace(/[^0-9.]/g, "")) || 0;

// =============================================
// FEATURE 1: DARK MODE — PERSISTENT
// =============================================
const applyProfileDarkStyles = (isDark) => {
    const profileTab = document.getElementById("profile-tab");
    if (!profileTab) return;

    profileTab.style.background = isDark ? "#1a1a1a" : "#fff";
    profileTab.style.color = isDark ? "#eee" : "#333";

    const h2 = profileTab.querySelector(".profile-header h2");
    if (h2) h2.style.color = isDark ? "#fff" : "#111";

    const xIcon = profileTab.querySelector(".profile-header .fa-xmark");
    if (xIcon) xIcon.style.color = isDark ? "#aaa" : "#777";

    // User info card (outer wrapper)
    const userInfoCard = profileTab.querySelector(".profile-content > div:first-child");
    if (userInfoCard) {
        userInfoCard.style.background = isDark ? "#2a2a2a" : "#f9f9f9";
    }

    // Name click area
    const nameArea = profileTab.querySelector("[onclick='changeGuestName()']");
    if (nameArea) nameArea.style.background = "transparent";

    const name = document.getElementById("guest-name-sidebar");
    const email = document.getElementById("guest-email-sidebar");
    if (name) name.style.color = isDark ? "#fff" : "#111";
    if (email) email.style.color = isDark ? "#aaa" : "#777";

    // Badge
    const badge = document.getElementById("guest-mode-badge");
    if (badge) {
        badge.style.background = isDark ? "#444" : "#eee";
        badge.style.color = isDark ? "#ccc" : "#555";
    }

    // Stats box
    const statsBox = document.getElementById("profile-stats-box");
    if (statsBox) {
        statsBox.style.background = isDark ? "#2a2a2a" : "#fff";
        statsBox.style.border = isDark ? "1px solid #333" : "1px solid #eee";
        ["guest-orders-count", "guest-wallet", "guest-points"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.color = isDark ? "#fff" : "#111";
        });
        statsBox.querySelectorAll("small").forEach(s => s.style.color = "#888");
        statsBox.querySelectorAll("div[style*='border-left']").forEach(d => {
            d.style.borderLeft = isDark ? "1px solid #444" : "1px solid #eee";
            d.style.borderRight = isDark ? "1px solid #444" : "1px solid #eee";
        });
    }

    // Menu list rows
    profileTab.querySelectorAll(".profile-menu-list > div").forEach(d => {
        d.style.borderColor = isDark ? "#333" : "#f5f5f5";
        if (!d.getAttribute("onclick")?.includes("handleLogout"))
            d.style.color = isDark ? "#ddd" : "#333";
    });

    // History box
    const hbox = document.getElementById("history-box");
    if (hbox) {
        hbox.style.background = isDark ? "#2a2a2a" : "#fff";
        hbox.style.borderColor = isDark ? "var(--gold-finger)" : "var(--gold-finger)";
        // History content text
        const hcontent = document.getElementById("history-content");
        if (hcontent) {
            hcontent.style.color = isDark ? "#ccc" : "#555";
            // All inner text spans
            hcontent.querySelectorAll("div, span, small").forEach(el => {
                if (!el.style.color || el.style.color === "rgb(136, 136, 136)") return;
                el.style.color = isDark ? "#ccc" : "#555";
            });
            // Order date lines
            hcontent.querySelectorAll("span[style*='color:#888']").forEach(el => {
                el.style.color = isDark ? "#888" : "#888";
            });
        }
    }

    // Recently viewed section
    const rvSection = profileTab.querySelector(".recently-viewed-section");
    if (rvSection) {
        const h5 = rvSection.querySelector("h5");
        if (h5) h5.style.color = isDark ? "#aaa" : "";
        rvSection.querySelectorAll(".rv-item").forEach(item => {
            item.style.background = isDark ? "#2a2a2a" : "#f9f9f9";
            item.style.borderColor = isDark ? "#333" : "#eee";
        });
        rvSection.querySelectorAll(".rv-name").forEach(el => el.style.color = isDark ? "#ddd" : "#333");
        rvSection.querySelectorAll(".rv-price").forEach(el => el.style.color = isDark ? "var(--gold-finger)" : "var(--gold-finger)");
    }

    // Sign up banner
    const banner = document.getElementById("profile-signup-banner");
    if (banner) {
        banner.style.background = isDark ? "#2a2a2a" : "var(--hint-yellow)";
        banner.style.border = isDark ? "1px solid var(--gold-finger)" : "none";
        const bp = banner.querySelector("p");
        if (bp) bp.style.color = isDark ? "#eee" : "#333";
    }

    // Filter labels
    profileTab.querySelectorAll(".price-filter label, .rating-filter label")
        .forEach(l => l.style.color = isDark ? "#eee" : "");
};

const applyNewsletterDarkStyles = (isDark) => {
    const card = document.querySelector(".newsletter-card");
    if (!card) return;
    card.style.background = isDark ? "#f5a623" : "";
    const texts = card.querySelectorAll("h5, h2, h2 span, .para, p");
    texts.forEach(t => t.style.color = isDark ? "#111" : "");
    const input = card.querySelector("input");
    if (input) { input.style.background = "#fff"; input.style.color = "#111"; }
    const btn = card.querySelector(".btn");
    if (btn) { btn.style.background = isDark ? "#111" : ""; btn.style.color = isDark ? "#fff" : ""; }
};

const applyTheme = () => {
    const isDark = localStorage.getItem("foodie_theme") === "dark";
    if (isDark) {
        document.body.classList.add("dark-theme");
        const icon = themeBtn?.querySelector("i");
        if (icon) icon.classList.replace("fa-moon", "fa-sun");
    }
    applyProfileDarkStyles(isDark);
    applyNewsletterDarkStyles(isDark);
};

if (themeBtn) {
    themeBtn.onclick = (e) => {
        e.preventDefault();
        document.body.classList.toggle("dark-theme");
        const isDark = document.body.classList.contains("dark-theme");
        const icon = themeBtn.querySelector("i");
        icon.classList.toggle("fa-moon");
        icon.classList.toggle("fa-sun");
        localStorage.setItem("foodie_theme", isDark ? "dark" : "light");
        applyProfileDarkStyles(isDark);
        applyNewsletterDarkStyles(isDark);
    };
}

// =============================================
// FEATURE 15: NAVBAR SCROLL EFFECT
// =============================================
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (!header) return;
    if (window.scrollY > 60) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// =============================================
// FEATURE 17: ACTIVE NAV LINK ON SCROLL
// =============================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".navlist a");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 130) current = sec.getAttribute("id");
    });
    navLinks.forEach(link => {
        link.classList.remove("nav-active");
        if (link.getAttribute("href") === `#${current}`) link.classList.add("nav-active");
    });
});

// =============================================
// FEATURE 4: BACK TO TOP BUTTON
// =============================================
const createBackToTop = () => {
    const btn = document.createElement("button");
    btn.id = "back-to-top";
    btn.innerHTML = `<i class="fa-solid fa-arrow-up"></i>`;
    document.body.appendChild(btn);
    window.addEventListener("scroll", () => {
        btn.classList.toggle("visible", window.scrollY > 400);
    });
    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
};

// =============================================
// MOBILE MENU
// =============================================
window.closeMenu = () => {
    mobileMenu.classList.remove("mobile-menu-active");
    const icon = bars.querySelector("i");
    if (icon) { icon.classList.replace("fa-xmark", "fa-bars"); }
    document.body.style.overflow = "auto";
};

bars.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    mobileMenu.classList.toggle("mobile-menu-active");
    const icon = bars.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-xmark");
});

document.querySelectorAll(".mobile-menu li a").forEach(link => link.addEventListener("click", () => closeMenu()));

// =============================================
// WISHLIST CLOSE HELPER
// =============================================
const closeWishlist = () => {
    const wt = document.querySelector(".wishlist-tab");
    if (wt) { wt.classList.remove("wishlist-tab-active"); document.body.classList.remove("wishlist-open"); }
};

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close-wishlist") || e.target.closest?.(".close-wishlist")) closeWishlist();
});

// =============================================
// WISHLIST OPEN
// =============================================
window.openWishlistDirectly = () => {
    const wt = document.querySelector(".wishlist-tab");
    if (cartTab) { cartTab.classList.remove("cart-tab-active"); document.body.classList.remove("cart-open"); }
    closeMenu();
    if (wt) { wt.classList.add("wishlist-tab-active"); document.body.classList.add("wishlist-open"); renderWishlist(); }
};

// =============================================
// TOGGLE WISHLIST — F8: confetti on first item
// =============================================
const toggleWishlist = (id, event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const idx = wishlist.indexOf(id);
    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast("Removed from Wishlist 💔");
    } else {
        wishlist.push(id);
        showToast("Added to Wishlist! ❤️");
        // F8: confetti only on first-ever wishlist add
        if (neverWishlisted && typeof confetti === "function") {
            neverWishlisted = false;
            confetti({ particleCount: 90, spread: 65, origin: { y: 0.35 }, colors: ["#e74c3c", "#f2bd12", "#fff"] });
        }
    }
    localStorage.setItem("foodie_wishlist", JSON.stringify(wishlist));
    showCards(currentFilter);
    renderWishlist();
};

const renderWishlist = () => {
    const wl = document.querySelector(".wishlist-list");
    if (!wl) return;
    if (wishlist.length === 0) {
        wl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:20px;">
            <i class="fa-solid fa-heart" style="font-size:4rem;color:#e74c3c;margin-bottom:15px;animation:heartbeat 1.5s infinite;"></i>
            <p style="font-size:1.2rem;font-weight:600;color:#333;margin:0;">No favorites yet! 🍕</p>
            <p style="font-size:0.9rem;color:#777;margin-top:10px;">Explore the menu and heart your favorites!</p>
        </div>`;
        return;
    }
    wl.innerHTML = "";
    wishlist.forEach(id => {
        const p = productlist.find(x => x.id === id);
        if (!p) return;
        const div = document.createElement("div");
        div.className = "wishlist-item";
        div.innerHTML = `
        <img src="${p.image}" style="width:65px;height:65px;object-fit:cover;border-radius:12px;">
        <div style="flex:1;"><h4 style="margin:0;font-size:0.95rem;font-weight:600;">${p.name}</h4>
            <p style="margin:2px 0 0;color:var(--gold-finger);font-weight:700;">$${p.price.toFixed(2)}</p></div>
        <div style="display:flex;align-items:center;gap:5px;background:#eee;padding:2px 6px;border-radius:8px;">
            <button onclick="changeWishQty(${p.id},-1)" style="border:none;background:none;cursor:pointer;font-size:1rem;line-height:1;">-</button>
            <span id="wqty-${p.id}" style="font-weight:bold;min-width:18px;text-align:center;">1</span>
            <button onclick="changeWishQty(${p.id},1)" style="border:none;background:none;cursor:pointer;font-size:1rem;line-height:1;">+</button>
        </div>
        <button class="btn" onclick="addFromWishlist(${p.id})" style="padding:5px 10px;font-size:0.7rem;margin-left:5px;">Add</button>
        <i class="fa-solid fa-trash" onclick="toggleWishlist(${p.id},event)" style="cursor:pointer;color:#e74c3c;margin-left:10px;"></i>`;
        wl.appendChild(div);
    });
};

window.changeWishQty = (id, delta) => {
    const el = document.getElementById(`wqty-${id}`);
    if (el) el.innerText = Math.max(1, parseInt(el.innerText) + delta);
};

window.addFromWishlist = (id) => {
    const p = productlist.find(x => x.id === id);
    const q = parseInt(document.getElementById(`wqty-${id}`)?.innerText || 1);
    if (p) { for (let i = 0; i < q; i++) addToCart(p); showToast(`${q} × ${p.name} added! 🛒`); }
};

// =============================================
// CART OPEN / CLOSE
// =============================================
cartIcon.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    closeWishlist(); closeMenu();
    cartTab.classList.add("cart-tab-active");
    document.body.classList.add("cart-open");
    renderCart();
});

closeBtn.onclick = (e) => {
    e.preventDefault();
    cartTab.classList.remove("cart-tab-active");
    document.body.classList.remove("cart-open");
    // F7: saved toast on close
    if (cartProduct.length > 0) showToast("Your cart is saved! 🛒");
};

if (clearBtn) {
    clearBtn.onclick = (e) => {
        e.preventDefault();
        if (!cartProduct.length) return showToast("Cart is already empty!");
        if (confirm("Clear all items from cart?")) {
            cartProduct = []; saveCart(); renderCart(); showCards(currentFilter);
            resetPromo();
            showToast("Cart cleared! 🗑️");
        }
    };
}

// Global click — close panels when clicking outside
document.addEventListener("click", (e) => {
    const wt = document.querySelector(".wishlist-tab");
    const wi = document.querySelector(".wishlist-icon");
    if (!mobileMenu.contains(e.target) && !bars.contains(e.target)) closeMenu();
    if (!cartTab.contains(e.target) && !cartIcon.contains(e.target)) {
        cartTab.classList.remove("cart-tab-active");
        document.body.classList.remove("cart-open");
    }
    if (wt?.classList.contains("wishlist-tab-active") && !wt.contains(e.target) && wi && !wi.contains(e.target)) closeWishlist();
});
[mobileMenu, cartTab].forEach(el => el.addEventListener("click", e => e.stopPropagation()));

// =============================================
// CART OPERATIONS
// =============================================
const saveCart = () => localStorage.setItem("foodie_cart", JSON.stringify(cartProduct));
const loadCart = () => {
    cartProduct = JSON.parse(localStorage.getItem("foodie_cart")) || [];
    renderCart();
    showCards(currentFilter);
};

const updateTotals = () => {
    let subtotal = 0, totalQty = 0;
    cartProduct.forEach(i => { totalQty += i.quantity; subtotal += i.quantity * i.price; });
    const disc = (subtotal * discountPercent) / 100;
    const final = subtotal - disc;
    cartTotal.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:0.9rem;color:#555;margin-bottom:5px;">
            <span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        ${disc > 0 ? `<div style="display:flex;justify-content:space-between;font-size:0.9rem;color:#e74c3c;margin-bottom:5px;">
            <span>Discount (${discountPercent}%):</span><span>-$${disc.toFixed(2)}</span></div>` : ""}
        <div style="border-top:1px solid rgba(0,0,0,0.08);margin:8px 0;padding-top:8px;display:flex;justify-content:space-between;font-size:1.35rem;font-weight:700;">
            <span>Total:</span><span>$${final.toFixed(2)}</span></div>`;
    cartValue.textContent = totalQty;
};

const renderCart = () => {
    if (!cartProduct.length) {
        cartList.innerHTML = `<div class="empty-cart-msg"><i class="fa-solid fa-cart-shopping"></i><p>Your cart is empty!</p></div>`;
        updateTotals(); return;
    }
    cartList.innerHTML = "";
    cartProduct.forEach(product => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <div class="item-image"><img src="${product.image}" alt="${product.name}"></div>
            <div class="detail"><h4>${product.name}</h4><p>$${product.price.toFixed(2)} × ${product.quantity}</p></div>
            <div class="flex" style="gap:10px;">
                <span class="quantity-btn minus" style="cursor:pointer;"><i class="fa-solid fa-minus"></i></span>
                <span class="quantity-value">${product.quantity}</span>
                <span class="quantity-btn plus" style="cursor:pointer;"><i class="fa-solid fa-plus"></i></span>
            </div>`;
        div.querySelector(".plus").onclick = () => {
            if (product.quantity < product.stock) { product.quantity++; saveCart(); renderCart(); showCards(currentFilter); }
            else showToast("Stock limit reached! 🚫");
        };
        div.querySelector(".minus").onclick = () => {
            if (product.quantity > 1) { product.quantity--; playSound("remove"); saveCart(); renderCart(); showCards(currentFilter); }
            else {
                div.style.animation = "slideOut 0.3s forwards";
                setTimeout(() => { cartProduct = cartProduct.filter(p => p.id !== product.id); playSound("remove"); saveCart(); renderCart(); showCards(currentFilter); }, 280);
            }
        };
        cartList.appendChild(div);
    });
    updateTotals();
};

// =============================================
// ADD TO CART — F2: shake + red on limit
// =============================================
const addToCart = (product) => {
    const existing = cartProduct.find(i => i.id === product.id);
    const price = getPrice(product.price);
    if (existing) {
        if (existing.quantity < product.stock) { existing.quantity++; playSound("add"); showToast("Added more! 🛒"); }
        else {
            // F2: shake + red flash
            cartIcon.classList.add("shake");
            cartIcon.style.color = "#e74c3c";
            setTimeout(() => { cartIcon.classList.remove("shake"); cartIcon.style.color = ""; }, 700);
            showToast("Stock limit reached! 😕"); return;
        }
    } else {
        cartProduct.push({ ...product, quantity: 1, price });
        playSound("add"); showToast("Added to cart! 🛒");
    }
    cartIcon.classList.add("animate");
    setTimeout(() => cartIcon.classList.remove("animate"), 500);
    saveCart(); renderCart(); showCards(currentFilter);
};

// =============================================
// VOICE SEARCH
// =============================================
const voiceBtn = document.getElementById("voice-btn");
if (voiceBtn) {
    voiceBtn.onclick = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return showToast("Voice search not supported in this browser.");
        const rec = new SR();
        rec.lang = "en-US";

        // Listening state
        voiceBtn.style.color = "#e74c3c";
        voiceBtn.style.animation = "pulse 0.8s ease infinite";
        voiceBtn.title = "Listening...";
        showToast("Listening... 🎤 Speak now!");
        rec.start();

        rec.onresult = (ev) => {
            const text = ev.results[0][0].transcript;
            searchBar.value = text; searchQuery = text;
            showCards(currentFilter);
        };
        rec.onspeechend = () => rec.stop();
        rec.onend = () => {
            voiceBtn.style.color = "var(--gold-finger)";
            voiceBtn.style.animation = "";
            voiceBtn.title = "Voice Search";
        };
        rec.onerror = () => {
            voiceBtn.style.color = "var(--gold-finger)";
            voiceBtn.style.animation = "";
            showToast("Couldn't hear you. Try again.");
        };
    };
}

// =============================================
// FEATURE 6: SEARCH HIGHLIGHT
// =============================================
const highlight = (text, q) => {
    if (!q.trim()) return text;
    return text.replace(new RegExp(`(${q.trim()})`, "gi"),
        `<mark style="background:var(--gold-finger);color:#000;border-radius:3px;padding:0 2px;">$1</mark>`);
};

// =============================================
// FEATURE 16: STAGGERED CARD ENTRANCE
// =============================================
const animateCards = () => {
    document.querySelectorAll(".order-card").forEach((card, i) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(28px)";
        card.style.transition = `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`;
        setTimeout(() => { card.style.opacity = "1"; card.style.transform = "translateY(0)"; }, 30);
    });
};

// =============================================
// SHOW CARDS — F5 badge, F6 highlight,
//              F10 empty state, F11 product badge,
//              F13 calories, F16 animation
// =============================================
const showCards = (filter = "All") => {
    currentFilter = filter;
    cardList.innerHTML = "";

    let items = productlist.filter(p =>
        (filter === "All" || p.category === filter) &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        getPrice(p.price) <= maxPrice &&
        (p.rating || 4) >= minRating
    );

    if (sortType === "price-low") items.sort((a, b) => getPrice(a.price) - getPrice(b.price));
    if (sortType === "price-high") items.sort((a, b) => getPrice(b.price) - getPrice(a.price));

    // F10: Animated empty state
    if (!items.length) {
        cardList.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;">
            <div class="empty-float">🍽️</div>
            <h3 style="color:#bbb;font-weight:500;margin-top:1rem;">Nothing found!</h3>
            <p style="color:#ccc;margin-top:0.4rem;">Try a different filter or search term</p>
            <button class="btn" onclick="resetFilters()" style="margin-top:1.5rem;">Reset Filters</button>
        </div>`;
        return;
    }

    items.forEach(product => {
        const inCart = cartProduct.find(i => i.id === product.id);
        const avail = product.stock - (inCart ? inCart.quantity : 0);
        const fav = wishlist.includes(product.id);
        const card = document.createElement("div");
        card.className = `order-card ${avail <= 0 ? "out-stock" : ""}`;

        // Stars
        let stars = "";
        for (let i = 1; i <= 5; i++)
            stars += `<i class="fa-${i <= (product.rating || 4) ? "solid" : "regular"} fa-star rating-star"
                         data-id="${product.id}" data-value="${i}" style="cursor:pointer;"></i>`;

        // F5: in-cart badge — sirf tab dikhao jab qty control na ho
        const cartBadge = (inCart && avail <= 0) ? `<span class="cart-badge">${inCart.quantity} in cart</span>` : "";
        // F11: product badge
        const pBadge = product.badge ? `<span class="product-badge">${product.badge}</span>` : "";
        // F13: calories
        const calTag = product.calories
            ? `<span class="calorie-tag"><i class="fa-solid fa-fire"></i> ${product.calories} cal</span>` : "";

        card.innerHTML = `
            ${pBadge}${cartBadge}
            ${avail <= 0 ? `<div class="out-of-stock-overlay"><span>Out of Stock</span></div>` : ""}
            <i class="fa-solid fa-heart wishlist-btn ${fav ? "active" : ""}" onclick="toggleWishlist(${product.id},event)"></i>
            <div class="card-image" style="cursor:pointer;" onclick="openQuickView(${product.id})">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <h4>${highlight(product.name, searchQuery)}</h4>
            <div class="stars" style="color:var(--gold-finger);">${stars}</div>
            ${calTag}
            <h4 class="price">$${product.price.toFixed(2)}</h4>
            ${avail <= 0
                ? `<button class="btn" disabled style="opacity:0.4;cursor:not-allowed;width:100%;background:#ccc;color:#666;">Out of Stock</button>`
                : inCart
                    ? `<div class="card-qty-control">
                            <button class="card-qty-btn minus" data-id="${product.id}"><i class="fa-solid fa-minus"></i></button>
                            <span class="card-qty-val">${inCart.quantity}</span>
                            <button class="card-qty-btn plus" data-id="${product.id}"><i class="fa-solid fa-plus"></i></button>
                       </div>`
                    : `<button class="btn add-btn">Add to Cart</button>`
            }`;

        if (avail > 0 && !inCart) {
            card.querySelector(".add-btn").onclick = () => addToCart(product);
        }
        if (inCart && avail > 0) {
            card.querySelector(".card-qty-btn.minus").onclick = (e) => {
                e.stopPropagation();
                const item = cartProduct.find(i => i.id === product.id);
                if (!item) return;
                if (item.quantity > 1) { item.quantity--; playSound("remove"); }
                else { cartProduct = cartProduct.filter(i => i.id !== product.id); playSound("remove"); }
                saveCart(); renderCart(); showCards(currentFilter);
            };
            card.querySelector(".card-qty-btn.plus").onclick = (e) => {
                e.stopPropagation();
                const item = cartProduct.find(i => i.id === product.id);
                if (!item) return;
                if (item.quantity < product.stock) {
                    item.quantity++;
                    playSound("add");
                    showToast(`${product.name} — ${item.quantity}x in cart 🛒`);
                } else showToast("Max stock reached! 📦");
                saveCart(); renderCart(); showCards(currentFilter);
            };
        }
        cardList.appendChild(card);
    });

    animateCards(); // F16
};

// =============================================
// RESET FILTERS
// =============================================
window.resetFilters = () => {
    searchQuery = ""; sortType = "default"; maxPrice = 25; minRating = 0;
    if (searchBar) searchBar.value = "";
    if (sortOptions) sortOptions.value = "default";
    const pr = document.getElementById("price-range");
    if (pr) { pr.value = 25; document.getElementById("price-val").innerText = "$25"; }
    const rs = document.getElementById("rating-select");
    if (rs) rs.value = "0";
    filterBtns.forEach(b => b.classList.remove("active"));
    filterBtns[0]?.classList.add("active");
    showCards("All");
    showToast("Filters reset ✨");
};

// =============================================
// SEARCH HISTORY
// =============================================
let searchHistory = JSON.parse(localStorage.getItem("foodie_search_history")) || [];

const saveSearchHistory = (query) => {
    if (!query.trim()) return;
    searchHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 4);
    localStorage.setItem("foodie_search_history", JSON.stringify(searchHistory));
};

const renderSearchHistory = () => {
    let box = document.getElementById("search-history-box");
    if (!box) {
        box = document.createElement("div");
        box.id = "search-history-box";
        box.className = "search-history-box";
        searchBar.parentElement.appendChild(box);
    }
    if (!searchHistory.length) { box.style.display = "none"; return; }
    box.style.display = "block";
    box.innerHTML = `
        <div class="sh-header">
            <span><i class="fa-solid fa-clock-rotate-left"></i> Recent Searches</span>
            <span class="sh-clear" onclick="clearSearchHistory()">Clear</span>
        </div>
        ${searchHistory.map(q => `
            <div class="sh-item" onclick="applySearchHistory('${q}')">
                <i class="fa-solid fa-magnifying-glass"></i> ${q}
            </div>`).join("")}`;
};

window.applySearchHistory = (q) => {
    searchBar.value = q; searchQuery = q;
    showCards(currentFilter);
    document.getElementById("search-history-box").style.display = "none";
};
window.clearSearchHistory = () => {
    searchHistory = [];
    localStorage.removeItem("foodie_search_history");
    const box = document.getElementById("search-history-box");
    if (box) box.style.display = "none";
};

searchBar.onfocus = () => renderSearchHistory();
searchBar.onblur = () => setTimeout(() => {
    const box = document.getElementById("search-history-box");
    if (box) box.style.display = "none";
}, 200);

// =============================================
// FILTERS
// =============================================
filterBtns.forEach(btn => btn.onclick = () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showCards(btn.dataset.filter);
});
searchBar.oninput = (e) => {
    searchQuery = e.target.value;
    if (searchQuery.trim()) saveSearchHistory(searchQuery.trim());
    showCards(currentFilter);
};
sortOptions.onchange = (e) => { sortType = e.target.value; showCards(currentFilter); };

const priceRange = document.getElementById("price-range");
if (priceRange) priceRange.oninput = (e) => {
    maxPrice = parseFloat(e.target.value);
    document.getElementById("price-val").innerText = `$${maxPrice}`;
    showCards(currentFilter);
};
const ratingSelect = document.getElementById("rating-select");
if (ratingSelect) ratingSelect.onchange = (e) => { minRating = parseInt(e.target.value); showCards(currentFilter); };

// =============================================
// CHECKOUT — F2: shake on empty + min order check
// =============================================
document.querySelector(".checkout-btn").onclick = (e) => {
    e.preventDefault();
    if (!cartProduct.length) {
        cartIcon.classList.add("shake");
        cartIcon.style.color = "#e74c3c";
        setTimeout(() => { cartIcon.classList.remove("shake"); cartIcon.style.color = ""; }, 700);
        showToast("Cart is empty! Add items first 🍕"); return;
    }
    // Min order check
    let subtotal = 0;
    cartProduct.forEach(i => subtotal += i.quantity * i.price);
    if (subtotal < 5) { showToast("Minimum order is $5! Add more items 🍔"); return; }

    cartList.innerHTML = `<div style="text-align:center;padding:20px;">
        <h4 style="margin-bottom:15px;">Processing your order...</h4>
        <div class="progress-container" style="display:block;">
            <div class="progress-bar" id="p-bar"></div>
        </div></div>`;
    let w = 0;
    const iv = setInterval(() => {
        w += 25;
        const pb = document.getElementById("p-bar");
        if (pb) pb.style.width = w + "%";
        if (w >= 100) { clearInterval(iv); completeOrder(); }
    }, 600);
};

let timerInterval;
const startDeliveryTimer = (mins) => {
    let t = mins * 60;
    const el = document.getElementById("delivery-timer");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const m = Math.floor(t / 60), s = t % 60;
        if (el) el.textContent = `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
        if (--t < 0) { clearInterval(timerInterval); if (el) el.textContent = "Arrived! 🏍️"; showToast("Your food has arrived! 🍔"); }
    }, 1000);
};

const completeOrder = () => {
    playSound("success");
    let subtotal = 0;
    cartProduct.forEach(i => subtotal += i.quantity * i.price);
    const disc = (subtotal * discountPercent) / 100;
    const bill = subtotal - disc;

    localStorage.setItem("last_order_receipt", JSON.stringify(cartProduct));
    const hist = JSON.parse(localStorage.getItem("all_orders")) || [];
    hist.unshift({ date: new Date().toLocaleString(), timestamp: Date.now(), items: [...cartProduct], total: bill });
    localStorage.setItem("all_orders", JSON.stringify(hist));

    const sl = document.getElementById("order-summary-list");
    if (sl) sl.innerHTML = cartProduct.map(i =>
        `<div style="display:flex;justify-content:space-between;"><span>${i.quantity}× ${i.name}</span><span>$${(i.quantity * i.price).toFixed(2)}</span></div>`
    ).join("");

    // Confetti burst
    if (typeof confetti === "function") {
        const end = Date.now() + 4000;
        const defs = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };
        const rng = (a, b) => Math.random() * (b - a) + a;
        const ci = setInterval(() => {
            if (Date.now() > end) return clearInterval(ci);
            const n = 50 * ((end - Date.now()) / 4000);
            confetti({ ...defs, particleCount: n, origin: { x: rng(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defs, particleCount: n, origin: { x: rng(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    document.getElementById("order-status-modal").style.display = "flex";
    startDeliveryTimer(25);

    currentPoints += 50;
    localStorage.setItem("guest_points", currentPoints);
    updatePointsDisplay();

    if (walletBalance >= bill) {
        walletBalance -= bill;
        localStorage.setItem("guest_wallet", walletBalance);
        updateWalletDisplay();
        showToast("Paid from Wallet! 💳");
    } else {
        showToast("Low balance — Cash on Delivery applied! 💵");
    }

    updateOrderStats();
    cartProduct = []; saveCart(); renderCart(); showCards(currentFilter);
    resetPromo();
    cartTab.classList.remove("cart-tab-active");
    document.body.classList.remove("cart-open");
};

window.closeStatusModal = () => {
    document.getElementById("order-status-modal").style.display = "none";
    clearInterval(timerInterval);
};

// =============================================
// PROMO
// =============================================
const resetPromo = () => {
    discountPercent = 0; appliedPromo = "";
    const pi = document.getElementById("promo-input");
    const pm = document.getElementById("promo-msg");
    if (pi) pi.value = "";
    if (pm) { pm.innerText = ""; }
    updateTotals();
};

document.getElementById("apply-promo").onclick = () => {
    const code = document.getElementById("promo-input").value.trim().toUpperCase();
    const msg = document.getElementById("promo-msg");
    if (!code) { msg.innerText = "Enter a promo code!"; msg.style.color = "orange"; return; }
    if (appliedPromo === code) return showToast("Code already applied!");
    const promos = { SAVE10: 10, FOODIE20: 20 };
    if (promos[code]) {
        discountPercent = promos[code]; appliedPromo = code;
        msg.innerText = `✅ ${discountPercent}% discount applied!`; msg.style.color = "green";
    } else {
        discountPercent = 0; appliedPromo = "";
        msg.innerText = "❌ Invalid promo code!"; msg.style.color = "red";
    }
    updateTotals();
};

// =============================================
// LOCATION
// =============================================
document.getElementById("get-location").onclick = () => {
    const el = document.getElementById("address-display");
    if (!navigator.geolocation) return showToast("Geolocation not supported!");
    el.innerText = "Fetching your location...";
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
            const data = await res.json();
            el.innerText = `📍 ${data.display_name.split(",").slice(0, 3).join(",")}`;
            showToast("Location captured! 📍");
        } catch { el.innerText = `Lat: ${coords.latitude.toFixed(3)}, Lon: ${coords.longitude.toFixed(3)}`; }
    }, () => showToast("Location permission denied!"));
};

// =============================================
// STAR RATING
// =============================================
document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("rating-star")) return;
    const id = parseInt(e.target.dataset.id);
    const val = parseInt(e.target.dataset.value);
    const p = productlist.find(x => x.id === id);
    if (p) { p.rating = val; showCards(currentFilter); localStorage.setItem("foodie_products", JSON.stringify(productlist)); showToast(`Rated ${p.name} ${val} ⭐`); }
});

// =============================================
// RECEIPT DOWNLOAD
// =============================================
const downloadReceipt = () => {
    if (!window.jspdf) return showToast("PDF library not loaded!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const items = JSON.parse(localStorage.getItem("last_order_receipt")) || [];
    if (!items.length) return showToast("No order details found!");
    doc.setFontSize(24); doc.setTextColor(255, 165, 0); doc.setFont("helvetica", "bold");
    doc.text("FOODIE EXPRESS", 105, y, { align: "center" });
    y += 15; doc.setFontSize(10); doc.setTextColor(100); doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, y);
    doc.text(`Invoice: #INV-${Math.floor(Math.random() * 100000)}`, 140, y);
    y += 8; doc.setDrawColor(200); doc.line(20, y, 190, y);
    y += 12; doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "bold");
    ["Item Name", "Qty", "Price", "Total"].forEach((h, i) => doc.text(h, [20, 105, 135, 170][i], y));
    y += 5; doc.line(20, y, 190, y);
    doc.setFont("helvetica", "normal");
    let sub = 0;
    items.forEach(item => {
        y += 10; const tot = item.quantity * item.price; sub += tot;
        doc.text(item.name, 20, y); doc.text(`${item.quantity}`, 108, y);
        doc.text(`$${item.price.toFixed(2)}`, 135, y); doc.text(`$${tot.toFixed(2)}`, 170, y);
        if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 15; doc.line(20, y, 190, y); y += 12;
    const disc = (sub * discountPercent) / 100, final = sub - disc;
    if (disc > 0) { doc.setTextColor(180, 0, 0); doc.text("Discount:", 135, y); doc.text(`-$${disc.toFixed(2)}`, 170, y); y += 8; }
    doc.setFontSize(16); doc.setTextColor(220, 0, 0);
    doc.text("Grand Total:", 120, y); doc.text(`$${final.toFixed(2)}`, 170, y);
    y += 25; doc.setFontSize(10); doc.setTextColor(150); doc.setFont("helvetica", "italic");
    doc.text("Thank you for ordering with Foodie Express!", 105, y, { align: "center" });
    doc.save("Foodie_Receipt.pdf");
};

// =============================================
// FEATURE 3: RECENTLY VIEWED
// =============================================
const addToRecentlyViewed = (id) => {
    recentlyViewed = recentlyViewed.filter(r => r !== id);
    recentlyViewed.unshift(id);
    if (recentlyViewed.length > 5) recentlyViewed.length = 5;
    localStorage.setItem("foodie_recently_viewed", JSON.stringify(recentlyViewed));
};

const renderRecentlyViewed = () => {
    const c = document.getElementById("recently-viewed-list");
    if (!c) return;
    const items = recentlyViewed.map(id => productlist.find(p => p.id === id)).filter(Boolean);
    if (!items.length) {
        c.innerHTML = `<p style="font-size:0.8rem;color:#bbb;text-align:center;padding:12px 0;">No recently viewed items yet.</p>`;
        return;
    }
    c.innerHTML = items.map(p => `
        <div onclick="openQuickView(${p.id})" class="rv-item">
            <img src="${p.image}" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;">
            <div style="flex:1;overflow:hidden;">
                <p style="margin:0;font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</p>
                <p style="margin:0;font-size:0.75rem;color:var(--gold-finger);">$${p.price.toFixed(2)}</p>
            </div>
            <i class="fa-solid fa-chevron-right" style="font-size:0.7rem;color:#ccc;flex-shrink:0;"></i>
        </div>`).join("");
};

// =============================================
// FEATURE 14: SHARE ITEM
// =============================================
window.shareItem = async (id) => {
    const p = productlist.find(x => x.id === id);
    if (!p) return;
    const text = `${p.name} — $${p.price.toFixed(2)} 🍕 Order now on Foodie!`;
    if (navigator.share) {
        try { await navigator.share({ title: `Check out ${p.name}!`, text, url: location.href }); }
        catch { showToast("Share cancelled."); }
    } else {
        navigator.clipboard.writeText(`${text} ${location.href}`).then(() => showToast("Link copied! 📋"));
    }
};

// =============================================
// QUICK VIEW — F3 recently viewed, F13 cal, F14 share
// =============================================
window.openQuickView = (id) => {
    const p = productlist.find(x => x.id === id);
    if (!p) return;
    addToRecentlyViewed(id); // F3
    renderRecentlyViewed();

    document.getElementById("modal-img").src = p.image;
    // Image zoom on hover fix
    const modalImg = document.getElementById("modal-img");
    modalImg.src = p.image;
    modalImg.onmouseenter = () => modalImg.style.transform = "scale(1.12)";
    modalImg.onmouseleave = () => modalImg.style.transform = "scale(1)";
    document.getElementById("modal-name").innerText = p.name;
    document.getElementById("modal-item-name-inline").innerText = p.name;
    document.getElementById("modal-price").innerText = `$${p.price.toFixed(2)}`;
    document.getElementById("modal-ingredients").innerText = p.ingredients || "Fresh Produce, House Special Sauce, Organic Herbs";

    const badge = document.getElementById("modal-badge");
    const isNonVeg = p.category.includes("Non-Veg");
    badge.innerText = isNonVeg ? "Non-Veg" : "Veg";
    badge.style.background = isNonVeg ? "#ffebee" : "#e8f5e9";
    badge.style.color = isNonVeg ? "#c62828" : "#2e7d32";

    let stars = "";
    for (let i = 1; i <= 5; i++) stars += `<i class="fa-${i <= (p.rating || 4) ? "solid" : "regular"} fa-star"></i>`;
    document.getElementById("modal-stars-display").innerHTML = stars + " (Customer Choice)";

    // F13: calories in modal
    const calEl = document.getElementById("modal-calories");
    if (calEl) calEl.innerHTML = p.calories ? `<i class="fa-solid fa-fire" style="color:#e67e22;"></i> ${p.calories} calories` : "";

    // F14: share btn
    const sb = document.getElementById("modal-share-btn");
    if (sb) sb.onclick = () => shareItem(id);

    document.getElementById("quick-view-modal").style.display = "flex";
    document.getElementById("modal-add-btn").onclick = () => { addToCart(p); closeQuickView(); };
};

window.closeQuickView = () => { document.getElementById("quick-view-modal").style.display = "none"; };
document.getElementById("quick-view-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("quick-view-modal")) closeQuickView();
});

// =============================================
// FEATURE 12: ORDER AGAIN
// =============================================
window.orderAgain = (index) => {
    const orders = JSON.parse(localStorage.getItem("all_orders")) || [];
    const order = orders[index];
    if (!order) return;
    let added = 0, skipped = 0;
    order.items.forEach(item => {
        const p = productlist.find(x => x.id === item.id);
        if (!p) return;
        const inCart = cartProduct.find(i => i.id === p.id);
        const avail = p.stock - (inCart ? inCart.quantity : 0);
        if (avail > 0) { addToCart(p); added++; }
        else skipped++;
    });
    if (skipped > 0) showToast(`${added} added, ${skipped} out of stock! 🛒`);
    else showToast(`${added} items added to cart! 🛒`);
    cartTab.classList.add("cart-tab-active");
    document.body.classList.add("cart-open");
    renderCart();
};

// =============================================
// AUTH MODAL
// =============================================
window.openLoginModal = () => {
    isLoginMode = true;
    document.getElementById("auth-title").innerText = "Welcome Back! 🍕";
    document.getElementById("auth-desc").innerText = "Please enter your details to login";
    document.getElementById("name-field").style.display = "none";
    document.getElementById("toggle-text").innerText = "Don't have an account?";
    document.getElementById("toggle-link").innerText = "Sign Up";
    document.getElementById("login-modal").style.display = "flex";
};
window.closeLogin = () => { document.getElementById("login-modal").style.display = "none"; };
window.toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    document.getElementById("auth-title").innerText = isLoginMode ? "Welcome Back! 🍕" : "Create Account 🎉";
    document.getElementById("auth-desc").innerText = isLoginMode ? "Please enter your details to login" : "Join Foodie and enjoy exclusive offers!";
    document.getElementById("name-field").style.display = isLoginMode ? "none" : "block";
    document.getElementById("toggle-text").innerText = isLoginMode ? "Don't have an account?" : "Already have an account?";
    document.getElementById("toggle-link").innerText = isLoginMode ? "Sign Up" : "Login";
};
window.handleAuthSubmit = () => {
    const email = document.getElementById("user-email").value.trim();
    const pass = document.getElementById("user-password").value;
    const fullname = document.getElementById("user-fullname")?.value.trim();

    if (!email || !email.includes("@")) return showToast("Please enter a valid email!");
    if (pass.length < 6) return showToast("Password must be at least 6 characters!");
    if (!isLoginMode && !fullname) return showToast("Please enter your name!");

    const name = isLoginMode ? (localStorage.getItem("guest_name") || email.split("@")[0]) : fullname;
    const initial = name.charAt(0).toUpperCase();

    // Save to localStorage
    localStorage.setItem("guest_name", name);
    localStorage.setItem("guest_email", email);

    // Update sidebar
    const sn = document.getElementById("guest-name-sidebar");
    const em = document.getElementById("guest-email-sidebar");
    const av = document.getElementById("main-avatar");
    if (sn) sn.innerText = name;
    if (em) em.innerText = email;
    if (av) av.innerText = initial;

    // Update navbar pill
    const navSpan = document.querySelector(".user-profile-wrapper span");
    const navInitial = document.querySelector(".user-profile-wrapper div");
    if (navSpan) navSpan.innerText = name;
    if (navInitial) navInitial.innerText = initial;

    // Update Guest Mode badge to "Member"
    const badge = document.querySelector("#profile-tab span[style*='uppercase']");
    if (badge) { badge.innerText = "Member ✓"; badge.style.background = "#2ecc71"; badge.style.color = "#fff"; }

    // Bonus points for signup
    if (!isLoginMode) {
        currentPoints += 100;
        localStorage.setItem("guest_points", currentPoints);
        updatePointsDisplay();
        showToast(`Welcome ${name}! +100 Bonus Points 🎊`);
    } else {
        showToast(`Welcome back, ${name}! 🎉`);
    }

    closeLogin();
};
document.getElementById("login-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("login-modal")) closeLogin();
});

// =============================================
// APP COMING SOON
// =============================================
window.appComingSoon = () => {
    showToast("Mobile app coming soon! 🚀 Stay tuned.");
    const btn = document.querySelector("#about .btn");
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-hourglass-half"></i>&nbsp; Coming Soon...`;
    setTimeout(() => btn.innerHTML = orig, 3000);
};

// =============================================
// PROFILE
// =============================================
window.toggleProfile = () => {
    const tab = document.getElementById("profile-tab");
    const ov = document.getElementById("profile-overlay");
    // Close mobile menu first if open
    closeMenu();
    tab.classList.toggle("active");
    if (tab.classList.contains("active")) {
        ov.style.display = "block";
        ov.style.zIndex = "14999";
        document.body.style.overflow = "hidden";
        renderRecentlyViewed();
        const isDark = document.body.classList.contains("dark-theme");
        applyProfileDarkStyles(isDark);
        restoreAvatar();
    } else {
        ov.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

window.changeGuestName = () => {
    const name = prompt("Enter your display name:");
    if (!name?.trim()) return;
    const n = name.trim();
    const initial = n.charAt(0).toUpperCase();
    // Sidebar
    const sn = document.getElementById("guest-name-sidebar");
    if (sn) sn.innerText = n;
    // Profile avatar (big circle)
    const av = document.getElementById("main-avatar");
    if (av) av.innerText = initial;
    // Navbar "Guest G" pill — span = name, small div = initial
    const navSpan = document.querySelector(".user-profile-wrapper span");
    if (navSpan) navSpan.innerText = n;
    const navInitial = document.querySelector(".user-profile-wrapper div");
    if (navInitial) navInitial.innerText = initial;
    localStorage.setItem("guest_name", n);
    showToast(`Welcome, ${n}! ✨`);
};

// =============================================
// WALLET & POINTS
// =============================================
window.updateWalletDisplay = () => {
    const el = document.getElementById("guest-wallet");
    if (el) el.innerText = `$${walletBalance.toFixed(2)}`;
};
const updatePointsDisplay = () => {
    const el = document.getElementById("guest-points");
    if (el) { el.innerText = currentPoints; el.style.color = "#27ae60"; setTimeout(() => el.style.color = "", 600); }
};

// =============================================
// ORDER HISTORY — F12: Order Again button
// =============================================
window.showLastOrder = () => {
    const box = document.getElementById("history-box");
    const con = document.getElementById("history-content");
    const orders = JSON.parse(localStorage.getItem("all_orders")) || [];
    if (box.style.display === "block") { box.style.display = "none"; return; }
    if (!orders.length) { showToast("No order history yet! 🍕"); return; }
    box.style.display = "block";
    con.style.maxHeight = "380px";
    con.style.overflowY = "auto";
    con.innerHTML = orders.map((order, i) => `
        <div style="border-bottom:2px dashed #eee;padding:12px 0;margin-bottom:5px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:0.7rem;color:#888;">Order #${orders.length - i} · ${order.date}</span>
            </div>
            ${order.items.map(it => `
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-top:3px;">
                    <span>${it.quantity}× ${it.name}</span><span>$${(it.quantity * it.price).toFixed(2)}</span>
                </div>`).join("")}
            <div style="text-align:right;font-weight:bold;margin-top:5px;color:#27ae60;">Total: $${order.total.toFixed(2)}</div>
            <div style="display:flex;gap:8px;margin-top:10px;">
                <button onclick="trackOrder(${i})" class="btn" style="flex:1;font-size:0.7rem;padding:6px 10px;border-radius:8px;background:var(--gold-finger);">
                    <i class="fa-solid fa-location-dot"></i> Track Order
                </button>
                <button onclick="orderAgain(${i})" class="btn" style="flex:1;font-size:0.7rem;padding:6px 10px;border-radius:8px;background:#27ae60;">
                    🔁 Order Again
                </button>
            </div>
        </div>`).join("");
};

// =============================================
// ORDER TRACKING
// =============================================
const trackingSteps = [
    { icon: "fa-receipt", label: "Order Placed", desc: "Your order has been received" },
    { icon: "fa-fire-burner", label: "Preparing Food", desc: "Our chefs are cooking your meal" },
    { icon: "fa-box-open", label: "Packed & Ready", desc: "Your order is packed and ready" },
    { icon: "fa-motorcycle", label: "Out for Delivery", desc: "Rider is on the way to you" },
    { icon: "fa-circle-check", label: "Delivered", desc: "Enjoy your meal! Rate us ⭐" },
];

window.trackOrder = (orderIndex) => {
    const orders = JSON.parse(localStorage.getItem("all_orders")) || [];
    const order = orders[orderIndex];
    if (!order) return;

    // Determine step based on time elapsed (simulate progress)
    const elapsed = order.timestamp
        ? (Date.now() - order.timestamp) / 1000 / 60
        : 999; // no timestamp = old order = delivered
    let currentStep = 4;
    if (elapsed < 3) currentStep = 0;
    else if (elapsed < 8) currentStep = 1;
    else if (elapsed < 14) currentStep = 2;
    else if (elapsed < 22) currentStep = 3;
    const minsLeft = Math.max(0, Math.round(25 - elapsed));

    // Build modal
    let modal = document.getElementById("track-order-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "track-order-modal";
        modal.style.cssText = "display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:30000;justify-content:center;align-items:flex-end;";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="track-modal-inner">
            <div class="track-modal-handle"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="margin:0;font-size:1.2rem;">
                    <i class="fa-solid fa-location-dot" style="color:var(--gold-finger);margin-right:8px;"></i>
                    Track Order #${orders.length - orderIndex}
                </h3>
                <i class="fa-solid fa-xmark" onclick="closeTrackModal()" style="cursor:pointer;font-size:1.3rem;color:#888;"></i>
            </div>

            <div style="background:#fdf7e2;border-radius:12px;padding:12px 16px;margin-bottom:20px;font-size:0.82rem;color:#555;">
                <strong>Placed:</strong> ${order.date} &nbsp;·&nbsp;
                <strong>Total:</strong> <span style="color:#27ae60;">$${order.total.toFixed(2)}</span>
            </div>

            <div class="track-steps">
                ${trackingSteps.map((step, i) => `
                    <div class="track-step ${i <= currentStep ? "done" : ""} ${i === currentStep ? "active" : ""}">
                        <div class="track-step-icon">
                            <i class="fa-solid ${step.icon}"></i>
                        </div>
                        <div class="track-step-line ${i < trackingSteps.length - 1 ? "" : "hidden"}"></div>
                        <div class="track-step-text">
                            <span class="track-step-label">${step.label}</span>
                            <span class="track-step-desc">${step.desc}</span>
                        </div>
                    </div>`).join("")}
            </div>

            <div style="margin-top:20px;text-align:center;background:#f9f9f9;border-radius:12px;padding:12px;">
                <p style="margin:0;font-size:0.82rem;color:#888;">
                    ${currentStep < 4
            ? `<i class="fa-solid fa-clock" style="color:var(--gold-finger);"></i> Estimated arrival: <strong>${minsLeft} min</strong>`
            : `<i class="fa-solid fa-circle-check" style="color:#27ae60;"></i> <strong>Order Delivered!</strong> We hope you enjoyed it.`}
                </p>
            </div>
        </div>`;

    modal.style.display = "flex";
    setTimeout(() => modal.querySelector(".track-modal-inner").classList.add("slide-up"), 10);
};

window.closeTrackModal = () => {
    const modal = document.getElementById("track-order-modal");
    if (!modal) return;
    const inner = modal.querySelector(".track-modal-inner");
    inner.classList.remove("slide-up");
    setTimeout(() => modal.style.display = "none", 300);
};

// Close on backdrop click
document.addEventListener("click", (e) => {
    const modal = document.getElementById("track-order-modal");
    if (modal && e.target === modal) closeTrackModal();
});

window.updateOrderStats = () => {
    const el = document.getElementById("guest-orders-count");
    if (el) el.innerText = (JSON.parse(localStorage.getItem("all_orders")) || []).length;
};

window.handleLogout = () => {
    if (!confirm("⚠️ Logout & Reset?\n\nThis will clear your cart, wishlist, wallet, points and order history.\n\nAre you sure?")) return;
    localStorage.clear();
    showToast("Session cleared! Refreshing... 🔄");
    setTimeout(() => location.reload(), 1000);
};

// =============================================
// NEWSLETTER — EmailJS + LocalStorage
// =============================================

// ⚙️ Apni EmailJS values yahan fill karo:
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";    // emailjs.com → Account → Public Key
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";    // emailjs.com → Email Services → Service ID
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";   // emailjs.com → Email Templates → Template ID

// EmailJS init
if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

window.handleSubscribe = async () => {
    const inp = document.getElementById("newsletter-email");
    const val = inp.value.trim().toLowerCase();

    // Validation
    if (!val || !val.includes("@")) {
        showToast("Please enter a valid email! ❌");
        return;
    }

    // Already subscribed check
    const subscribers = JSON.parse(localStorage.getItem("foodie_subscribers")) || [];
    if (subscribers.includes(val)) {
        showToast("You're already subscribed! 😊");
        return;
    }

    // Save to localStorage
    subscribers.push(val);
    localStorage.setItem("foodie_subscribers", JSON.stringify(subscribers));

    // Profile mein email update karo
    localStorage.setItem("guest_email", val);
    const emailEl = document.getElementById("guest-email-sidebar");
    if (emailEl) emailEl.innerText = val;

    // Points
    currentPoints += 50;
    localStorage.setItem("guest_points", currentPoints);
    updatePointsDisplay();

    // Confetti + Toast
    if (typeof confetti === "function")
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 }, colors: ["#FFD700", "#000"] });
    showToast("Subscribed! +50 Points Added 🎁");
    inp.value = "";

    // Send email via EmailJS (sirf tab jab keys fill ho)
    if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                subscriber_email: val,
                subscribe_date: new Date().toLocaleString(),
                total_subscribers: subscribers.length
            });
            showToast("Confirmation email sent! 📧");
        } catch (err) {
            console.error("EmailJS Error:", err);
            showToast("Subscribed! Email send failed — check EmailJS config.");
        }
    }
};

// =============================================
// TOAST
// =============================================
const showToast = (msg) => {
    let t = document.querySelector(".toast-msg");
    if (!t) { t = document.createElement("div"); t.className = "toast-msg"; document.body.appendChild(t); }
    t.style.zIndex = "20000";
    t.innerHTML = `<i class="fa-solid fa-bell"></i> ${msg}`;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 2800);
};

// =============================================
// INIT
// =============================================
const initApp = () => {
    // Skeleton
    cardList.innerHTML = Array(6).fill(`<div class="skeleton order-card" style="flex-basis:300px;min-height:340px;"></div>`).join("");

    applyTheme();      // F1
    createBackToTop(); // F4

    // Restore saved name
    const saved = localStorage.getItem("guest_name");
    if (saved) {
        const initial = saved.charAt(0).toUpperCase();
        const sn = document.getElementById("guest-name-sidebar");
        const av = document.getElementById("main-avatar");
        const navSpan = document.querySelector(".user-profile-wrapper span");
        const navInitial = document.querySelector(".user-profile-wrapper div");
        if (sn) sn.innerText = saved;
        if (av) av.innerText = initial;
        if (navSpan) navSpan.innerText = saved;
        if (navInitial) navInitial.innerText = initial;
    }

    // Restore saved email
    const savedEmail = localStorage.getItem("guest_email");
    if (savedEmail) {
        const emailEl = document.getElementById("guest-email-sidebar");
        if (emailEl) emailEl.innerText = savedEmail;
    }

    walletBalance = parseFloat(localStorage.getItem("guest_wallet")) || 50.00;
    currentPoints = parseInt(localStorage.getItem("guest_points")) || 120;
    updateWalletDisplay();
    updatePointsDisplay();
    updateOrderStats();

    fetch("products.json")
        .then(r => r.json())
        .then(fresh => {
            const saved = JSON.parse(localStorage.getItem("foodie_products")) || [];
            productlist = fresh.map(item => {
                const s = saved.find(x => x.id === item.id);
                return s ? { ...item, rating: s.rating } : item;
            });
            setTimeout(() => {
                loadCart();
                showCards("All");
                initSwiper();
                injectRedeemBtn();
                checkCartExpiry();
            }, 800);
            // Restore avatar immediately after DOM is ready (not after fetch delay)
            restoreAvatar();
        })
        .catch(() => showToast("Failed to load menu. Please refresh! ❌"));
};

window.onload = initApp;

// Always scroll to top on reload (remove hash from URL)
if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname);
}
window.scrollTo({ top: 0, behavior: "smooth" });

// =============================================
// SCROLL PROGRESS BAR
// =============================================
window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const bar = document.getElementById("scroll-progress");
    if (bar) bar.style.width = pct + "%";
});

// =============================================
// NOTIFICATION BELL
// =============================================
const notifications = [
    { icon: "🎉", text: "Use code SAVE10 for 10% off!", time: "Just now" },
    { icon: "🔥", text: "BBQ Chicken Wings — Hot & Spicy deal!", time: "2 min ago" },
    { icon: "💰", text: "You have $50 in your wallet!", time: "5 min ago" },
    { icon: "⭐", text: "Rate your last order and earn 20 points!", time: "10 min ago" },
];

const notifBtn = document.getElementById("notif-btn");
const notifDropdown = document.getElementById("notif-dropdown");

const renderNotifications = () => {
    notifDropdown.innerHTML = `
        <div class="notif-header">
            <span><i class="fa-solid fa-bell"></i> Notifications</span>
            <span class="notif-clear" onclick="clearNotifications()">Clear all</span>
        </div>
        ${notifications.map((n, i) => `
            <div class="notif-item" onclick="dismissNotif(${i})">
                <span class="notif-icon">${n.icon}</span>
                <div class="notif-body">
                    <p>${n.text}</p>
                    <small>${n.time}</small>
                </div>
                <i class="fa-solid fa-xmark notif-x"></i>
            </div>`).join("")}
        ${!notifications.length ? `<div class="notif-empty">No notifications 🎉</div>` : ""}
    `;
};

if (notifBtn) {
    notifBtn.onclick = (e) => {
        e.stopPropagation();
        const isOpen = notifDropdown.style.display === "block";
        notifDropdown.style.display = isOpen ? "none" : "block";
        if (!isOpen) { renderNotifications(); document.getElementById("notif-badge").style.display = "none"; }
    };
}

document.addEventListener("click", (e) => {
    if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBtn)
        notifDropdown.style.display = "none";
});

window.dismissNotif = (i) => {
    notifications.splice(i, 1);
    renderNotifications();
};
window.clearNotifications = () => {
    notifications.length = 0;
    renderNotifications();
};

// =============================================
// PROFILE PICTURE UPLOAD
// =============================================
window.handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const b64 = ev.target.result;
        localStorage.setItem("guest_avatar", b64);
        const av = document.getElementById("main-avatar");
        if (av) {
            av.innerHTML = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
        // Update navbar avatar
        const navInitial = document.querySelector(".user-profile-wrapper div");
        if (navInitial) navInitial.innerHTML = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        showToast("Profile picture updated! 📸");
    };
    reader.readAsDataURL(file);
};

// Restore saved avatar on load
const restoreAvatar = () => {
    const b64 = localStorage.getItem("guest_avatar");
    if (!b64) return;
    const av = document.getElementById("main-avatar");
    if (av) {
        av.style.background = "transparent";
        av.innerHTML = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
    const navInitial = document.querySelector(".user-profile-wrapper div");
    if (navInitial) navInitial.innerHTML = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
};

// =============================================
// POINTS REDEEM SYSTEM
// =============================================
// Add redeem button to cart total area via JS
const injectRedeemBtn = () => {
    if (document.getElementById("redeem-pts-btn")) return;
    const totalContainer = document.querySelector(".total-container");
    if (!totalContainer) return;
    const div = document.createElement("div");
    div.style.cssText = "padding:0 20px 10px;text-align:center;";
    div.innerHTML = `
        <button id="redeem-pts-btn" class="btn" onclick="redeemPoints()"
            style="width:100%;background:#8e44ad;font-size:0.85rem;padding:8px;">
            <i class="fa-solid fa-coins"></i> Redeem Points (<span id="redeem-pts-count">${currentPoints}</span> pts = $<span id="redeem-pts-val">${(currentPoints / 100).toFixed(2)}</span> off)
        </button>`;
    totalContainer.parentElement.insertBefore(div, totalContainer);
};

window.redeemPoints = () => {
    if (currentPoints < 100) return showToast("Need at least 100 points to redeem! 🪙");
    const discount = Math.floor(currentPoints / 100);
    discountPercent = 0; // override promo
    const totalEl = document.querySelector(".cart-total");
    let subtotal = 0;
    cartProduct.forEach(i => subtotal += i.quantity * i.price);
    const newTotal = Math.max(0, subtotal - discount);
    if (totalEl) totalEl.innerText = `$${newTotal.toFixed(2)} (−$${discount} redeemed)`;
    currentPoints = currentPoints % 100;
    localStorage.setItem("guest_points", currentPoints);
    updatePointsDisplay();
    showToast(`$${discount} redeemed from points! 🎉`);
};

// =============================================
// CART EXPIRY (24 hours)
// =============================================
const checkCartExpiry = () => {
    const saved = localStorage.getItem("cart_saved_at");
    if (!saved) { localStorage.setItem("cart_saved_at", Date.now()); return; }
    const hrs = (Date.now() - parseInt(saved)) / (1000 * 60 * 60);
    if (hrs >= 24) {
        cartProduct = []; saveCart(); renderCart(); showCards(currentFilter);
        localStorage.removeItem("cart_saved_at");
        showToast("Your cart expired after 24 hours 🕐");
    }
};

// =============================================
// IMAGE BLUR-TO-SHARP PLACEHOLDER
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".card-list img").forEach(img => {
        img.style.filter = "blur(8px)";
        img.style.transition = "filter 0.4s ease";
        img.onload = () => img.style.filter = "none";
        if (img.complete) img.style.filter = "none";
    });
});

// Observe new cards added dynamically
const imgObserver = new MutationObserver(() => {
    document.querySelectorAll(".order-card img:not([data-blur-done])").forEach(img => {
        img.setAttribute("data-blur-done", "1");
        img.style.filter = img.complete ? "none" : "blur(8px)";
        img.style.transition = "filter 0.4s ease";
        img.onload = () => img.style.filter = "none";
    });
});
if (cardList) imgObserver.observe(cardList, { childList: true });

// =============================================
// KEYBOARD SHORTCUTS
// =============================================
document.addEventListener("keydown", (e) => {
    // "/" — focus search
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchBar?.focus();
        showToast("Search activated ⌨️");
    }
    // Esc — close all modals
    if (e.key === "Escape") {
        document.getElementById("quick-view-modal").style.display = "none";
        document.getElementById("login-modal").style.display = "none";
        document.getElementById("order-status-modal").style.display = "none";
        if (cartTab?.classList.contains("cart-tab-active")) {
            cartTab.classList.remove("cart-tab-active");
            document.body.classList.remove("cart-open");
        }
        const pt = document.getElementById("profile-tab");
        if (pt?.classList.contains("active")) {
            pt.classList.remove("active");
            document.getElementById("profile-overlay").style.display = "none";
            document.body.style.overflow = "auto";
        }
        if (notifDropdown) notifDropdown.style.display = "none";
    }
    // "c" — open cart
    if (e.key === "c" && document.activeElement.tagName !== "INPUT") {
        cartIcon?.click();
    }
});

// =============================================
// PWA — manifest + service worker
// =============================================
const injectManifest = () => {
    const manifest = {
        name: "Foodie — Order Delicious Food",
        short_name: "Foodie",
        start_url: "./index.html",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#F2BD12",
        icons: [{ src: "images/delivery-boy.png", sizes: "192x192", type: "image/png" }]
    };
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("link");
    link.rel = "manifest"; link.href = url;
    document.head.appendChild(link);
};
injectManifest();
