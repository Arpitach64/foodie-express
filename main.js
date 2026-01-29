let wishlist = JSON.parse(localStorage.getItem("foodie_wishlist")) || [];
let currentPoints = parseInt(localStorage.getItem("guest_points")) || 120;

const playSound = (type) => {
    const sounds = {
        add: "sounds/add.mp3",      // Aapki local file ka rasta
        success: "sounds/success.mp3",
        remove: "sounds/remove.mp3"
    };

    const audio = new Audio(sounds[type]);

    // Volume thoda set kar sakte hain (0.0 to 1.0)
    audio.volume = 0.5;

    audio.play().catch(err => {
        console.log("Browser ne sound block ki. Pehle page par click karein!");
    });
};

// ===== SWIPER INITIALIZATION =====
const initSwiper = () => {
    new Swiper(".mySwiper", {
        loop: true,
        navigation: { nextEl: "#next", prevEl: "#prev" },
        breakpoints: { 768: { slidesPerView: 1 } }
    });
};

// ===== SELECTORS =====
const cartIcon = document.querySelector(".cart-icon");
const cartTab = document.querySelector(".cart-tab");
const closeBtn = document.querySelector(".close-btn");
const clearBtn = document.querySelector(".clear-btn"); // Added
const cardList = document.querySelector(".card-list");
const cartList = document.querySelector(".cart-list");
const cartTotal = document.querySelector(".cart-total");
const cartValue = document.querySelector(".cart-value");
const bars = document.querySelector(".bars");
const mobileMenu = document.querySelector(".mobile-menu");
const filterButtons = document.querySelectorAll(".filter-buttons button");
const searchBar = document.getElementById("search-bar");
const sortOptions = document.getElementById("sort-options");
const themeBtn = document.getElementById("theme-btn");

// ===== STATE =====
let productlist = [];
let cartProduct = [];
let currentFilter = "All";
let searchQuery = "";
let sortType = "default";
let maxPrice = 25;
let minRating = 0;
let discountPercent = 0;
let appliedPromo = "";

// Helper: Get numeric price safely
const getNumericPrice = (p) => {
    if (typeof p === 'number') return p;
    return parseFloat(String(p).replace(/[^0-9.]/g, '')) || 0;
};

// ================= NAVIGATION LOGIC =================
bars.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    mobileMenu.classList.toggle("mobile-menu-active");
    const icon = bars.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-xmark");
});

// ================= UPDATED WISHLIST LOGIC =================

// 1. Wishlist Kholna (With Body Shift & Cart Auto-Close)
window.openWishlistDirectly = () => {
    const wishlistTab = document.querySelector(".wishlist-tab");
    const mobileMenu = document.querySelector(".mobile-menu");

    // Pehle Cart ko band karo taaki layout overlap na ho
    if (cartTab) {
        cartTab.classList.remove("cart-tab-active");
        document.body.classList.remove("cart-open");
    }

    // Mobile menu band karo agar khula hai
    if (mobileMenu) mobileMenu.classList.remove("mobile-menu-active");

    if (wishlistTab) {
        wishlistTab.classList.add("wishlist-tab-active");
        document.body.classList.add("wishlist-open"); // Body shift logic
        renderWishlist();
    }
};

// 2. Wishlist Item Add/Remove Toggle
const toggleWishlist = (id, event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast("Removed from Wishlist");
    } else {
        wishlist.push(id);
        showToast("Added to Wishlist! ❤️");
    }
    localStorage.setItem("foodie_wishlist", JSON.stringify(wishlist));
    showCards(currentFilter); // UI cards update karein (heart icon color)
    renderWishlist(); // Wishlist sidebar update karein
};

const renderWishlist = () => {
    const wishlistList = document.querySelector(".wishlist-list");
    if (!wishlistList) return;

    // Pehle purana content saaf karein
    wishlistList.innerHTML = "";

    // Empty Check Logic
    if (wishlist.length === 0) {
    wishlistList.innerHTML = `
        <div style="
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 70vh; 
            text-align: center;
            padding: 20px;
        ">
            <i class="fa-solid fa-heart animate-heart" style="
                font-size: 4rem; 
                color: #e74c3c; 
                margin-bottom: 15px;
                display: block;
            "></i>
            <p style="font-size: 1.2rem; font-weight: 600; color: #333; margin: 0;">No favorites yet! 🍕</p>
            <p style="font-size: 0.9rem; color: #777; margin-top: 10px;">Explore our menu and heart your favorite food!</p>
        </div>`;
    return;
}

    // Agar items hain toh niche wala loop chalega
    wishlist.forEach(id => {
        const product = productlist.find(p => p.id === id);
        if (product) {
            const div = document.createElement("div");
            div.className = "wishlist-item";
// renderWishlist loop ke andar bas ye badalna hai:
div.innerHTML = `
    <img src="${product.image}" style="width:65px; height:65px; object-fit:cover; border-radius:12px;">
    <div style="flex:1">
        <h4 style="margin:0; font-size:0.95rem; font-weight:600;">${product.name}</h4>
        <p style="margin:2px 0 0; color:var(--gold-finger); font-weight:700;">$${product.price.toFixed(2)}</p>
    </div>
    
    <div style="display: flex; align-items: center; gap: 5px; background: #eee; padding: 2px 5px; border-radius: 5px;">
        <button onclick="changeWishQty(${product.id}, -1)" style="border:none; background:none; cursor:pointer;">-</button>
        <span id="qty-${product.id}" style="font-weight:bold; min-width:15px; text-align:center;">1</span>
        <button onclick="changeWishQty(${product.id}, 1)" style="border:none; background:none; cursor:pointer;">+</button>
    </div>

    <button class="btn" onclick="addFromWishlist(${product.id})" style="padding: 5px 10px; font-size: 0.7rem; margin-left:5px;">Add</button>
    
    <i class="fa-solid fa-trash" onclick="toggleWishlist(${product.id}, event)" style="cursor:pointer; color:#e74c3c; margin-left:10px;"></i>
`;
            wishlistList.appendChild(div);
        }
    });
};

// Temporary quantity store karne ke liye (sirf UI ke liye)
let tempWishlistQty = {};

const updateWishlistQty = (id, change) => {
    if (!tempWishlistQty[id]) tempWishlistQty[id] = 1;
    tempWishlistQty[id] += change;
    if (tempWishlistQty[id] < 1) tempWishlistQty[id] = 1;
    
    document.getElementById(`wish-qty-${id}`).innerText = tempWishlistQty[id];
};

const addWishlistToCart = (id) => {
    const product = productlist.find(p => p.id === id);
    const qty = tempWishlistQty[id] || 1;
    
    for (let i = 0; i < qty; i++) {
        addToCart(product);
    }
    showToast(`${qty} ${product.name} added to cart! 🛒`);
};

// 4. Wishlist se Cart mein bhejte waqt ka helper
const addToCartById = (id) => {
    if (!productlist || productlist.length === 0) {
        showToast("Loading items...");
        return;
    }
    const product = productlist.find(p => p.id === id);
    if (product) addToCart(product);
};

// 5. Global Click Listener (Wishlist Band Karne Ke Liye)
document.addEventListener("click", (e) => {
    const wishlistTab = document.querySelector(".wishlist-tab");
    const wishlistIcon = document.querySelector(".wishlist-icon"); // Navbar wala icon

    // Close button ya bahar click karne par band karo
    if (e.target.classList.contains("close-wishlist") ||
        (wishlistTab && !wishlistTab.contains(e.target) && wishlistIcon && !wishlistIcon.contains(e.target))) {

        if (wishlistTab && wishlistTab.classList.contains("wishlist-tab-active")) {
            wishlistTab.classList.remove("wishlist-tab-active");
            document.body.classList.remove("wishlist-open");
        }
    }
});

// ================= UPDATED CART ICON LISTENER =================
cartIcon.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Pehle Wishlist ko band karein agar wo khuli hai
    const wishlistTab = document.querySelector(".wishlist-tab");
    if (wishlistTab) {
        wishlistTab.classList.remove("wishlist-tab-active");
        document.body.classList.remove("wishlist-open"); // Wishlist ka shift remove karein
    }

    // 2. Mobile menu ko band karein
    mobileMenu.classList.remove("mobile-menu-active");

    // 3. Ab Cart kholien aur body ko shift karein
    cartTab.classList.add("cart-tab-active");
    document.body.classList.add("cart-open");

    // Cart render function call karein (optional but safe)
    renderCart();
});

closeBtn.onclick = (e) => {
    e.preventDefault();
    cartTab.classList.remove("cart-tab-active");
    document.body.classList.remove("cart-open");
};

// Clear Cart logic added here
if (clearBtn) {
    clearBtn.onclick = (e) => {
        e.preventDefault();
        if (cartProduct.length === 0) return showToast("Cart is already empty!");
        if (confirm("Clear all items?")) {
            cartProduct = [];
            saveCart();
            renderCart();
            showCards(currentFilter);
            showToast("Cart Cleared! 🗑️");
        }
    };
}

document.addEventListener("click", (e) => {
    const wishlistTab = document.querySelector(".wishlist-tab");
    const wishlistIcon = document.querySelector(".wishlist-icon");
    if (!mobileMenu.contains(e.target) && !bars.contains(e.target)) {
        mobileMenu.classList.remove("mobile-menu-active");
        const icon = bars.querySelector("i");
        if (icon) icon.classList.replace("fa-xmark", "fa-bars");
    }
    if (!cartTab.contains(e.target) && !cartIcon.contains(e.target)) {
        cartTab.classList.remove("cart-tab-active");
        document.body.classList.remove("cart-open");
    }
    if (wishlistTab && !wishlistTab.contains(e.target) && !wishlistIcon.contains(e.target)) {
        wishlistTab.classList.remove("wishlist-tab-active");
    }
});

[mobileMenu, cartTab].forEach(el => el.addEventListener("click", e => e.stopPropagation()));

// ================= THEME TOGGLE =================
if (themeBtn) {
    themeBtn.onclick = (e) => {
        e.preventDefault();
        document.body.classList.toggle("dark-theme");
        const icon = themeBtn.querySelector("i");
        if (document.body.classList.contains("dark-theme")) {
            icon.classList.replace("fa-moon", "fa-sun");
        } else {
            icon.classList.replace("fa-sun", "fa-moon");
        }
    };
}

// ================= CART OPERATIONS =================
const saveCart = () => localStorage.setItem("foodie_cart", JSON.stringify(cartProduct));

const loadCart = () => {
    cartProduct = JSON.parse(localStorage.getItem("foodie_cart")) || [];
    renderCart();
};

const updateTotals = () => {
    let subtotal = 0, totalQty = 0;
    cartProduct.forEach(item => {
        totalQty += item.quantity;
        subtotal += item.quantity * item.price;
    });
    let discountAmount = (subtotal * discountPercent) / 100;
    let finalTotal = subtotal - discountAmount;
    cartTotal.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 400; color: #444; margin-bottom: 5px;">
            <span>Subtotal:</span> <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${discountPercent > 0 ? `
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #d35400; margin-bottom: 5px;">
            <span>Discount (${discountPercent}%):</span> <span>-$${discountAmount.toFixed(2)}</span>
        </div>` : ''}
        <div style="border-top: 1px solid rgba(0,0,0,0.1); margin: 8px 0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 1.4rem; font-weight: 700;">
            <span>Total:</span> <span>$${finalTotal.toFixed(2)}</span>
        </div>
    `;
    cartValue.textContent = totalQty;
};

const renderCart = () => {
    if (cartProduct.length === 0) {
        cartList.innerHTML = `<div class="empty-cart-msg"><i class="fa-solid fa-cart-shopping"></i><p>Your cart is empty!</p></div>`;
        updateTotals();
        return;
    }
    cartList.innerHTML = "";
    cartProduct.forEach(product => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <div class="item-image"><img src="${product.image}" alt="${product.name}"></div>
            <div class="detail">
                <h4>${product.name}</h4>
                <p>$${product.price.toFixed(2)} x ${product.quantity}</p>
            </div>
            <div class="flex" style="gap:10px">
                <span class="quantity-btn minus" style="cursor:pointer"><i class="fa-solid fa-minus"></i></span>
                <span class="quantity-value">${product.quantity}</span>
                <span class="quantity-btn plus" style="cursor:pointer"><i class="fa-solid fa-plus"></i></span>
            </div>
        `;
        div.querySelector(".plus").onclick = () => {
            if (product.quantity < product.stock) {
                product.quantity++;
                saveCart(); renderCart(); showCards(currentFilter);
            } else { showToast("Limit reached!"); }
        };
        div.querySelector(".minus").onclick = () => {
            if (product.quantity > 1) {
                product.quantity--;
                playSound("remove");
            } else {
                div.classList.add("slide-out");
                setTimeout(() => {
                    cartProduct = cartProduct.filter(p => p.id !== product.id);
                    playSound("remove");
                    saveCart();
                    renderCart();
                    showCards(currentFilter);
                }, 300);
                return;
            }
            saveCart();
            renderCart();
            showCards(currentFilter);
        };
        cartList.appendChild(div);
    });
    updateTotals();
};

const addToCart = (product) => {
    const existing = cartProduct.find(i => i.id === product.id);
    const numericPrice = getNumericPrice(product.price);
    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity++;
            playSound("add");
            showToast("Added more to cart!");
        } else { showToast("Out of stock!"); return; }
    } else {
        cartProduct.push({ ...product, quantity: 1, price: numericPrice });
        playSound("add");
        showToast("Added to cart!");
    }
    if(typeof updateGuestStats === 'function') updateGuestStats();
    cartIcon.classList.add("animate");
    setTimeout(() => cartIcon.classList.remove("animate"), 500);
    saveCart(); renderCart(); showCards(currentFilter);
};

//================= Voice Search =================
const voiceBtn = document.getElementById("voice-btn");
if (voiceBtn) {
    voiceBtn.onclick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return showToast("Voice Search not supported.");
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        voiceBtn.style.color = "red";
        showToast("Listening...");
        recognition.start();
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchBar.value = transcript;
            searchQuery = transcript;
            showCards(currentFilter);
            voiceBtn.style.color = "var(--gold-finger)";
        };
        recognition.onspeechend = () => { recognition.stop(); voiceBtn.style.color = "var(--gold-finger)"; };
        recognition.onerror = () => { voiceBtn.style.color = "var(--gold-finger)"; showToast("Error listening."); };
    };
}

// ================= SHOW CARDS =================
const showCards = (filter = "All") => {
    currentFilter = filter;
    cardList.innerHTML = "";
    let filtered = productlist.filter(item => {
        const itemPrice = getNumericPrice(item.price);
        const matchesCategory = (filter === "All" || item.category === filter);
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = itemPrice <= maxPrice;
        const matchesRating = (item.rating || 4) >= minRating;
        return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    });
    if (sortType === "price-low") filtered.sort((a, b) => getNumericPrice(a.price) - getNumericPrice(b.price));
    if (sortType === "price-high") filtered.sort((a, b) => getNumericPrice(b.price) - getNumericPrice(a.price));
    if (filtered.length === 0) {
        cardList.innerHTML = `<h3 style="grid-column:1/-1; margin-top:2rem">No items found! 🍕</h3>`;
        return;
    }
    filtered.forEach(product => {
        const inCart = cartProduct.find(i => i.id === product.id);
        const availableStock = product.stock - (inCart ? inCart.quantity : 0);
        const isFavorite = wishlist.includes(product.id);
        const card = document.createElement("div");
        card.className = `order-card ${availableStock <= 0 ? 'out-stock' : ''}`;
        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<i class="fa-${i <= (product.rating || 4) ? 'solid' : 'regular'} fa-star rating-star" 
                            data-id="${product.id}" data-value="${i}" style="cursor:pointer"></i>`;
        }
        
        card.innerHTML = `
    <i class="fa-solid fa-heart wishlist-btn ${isFavorite ? 'active' : ''}" 
       onclick="toggleWishlist(${product.id}, event)"></i>
       
    <div class="card-image"><img src="${product.image}" alt="${product.name}"></div>
    <h4>${product.name}</h4>
    <div class="stars" style="color:var(--gold-finger)">${starsHTML}</div>
    <h4 class="price">$${product.price.toFixed(2)}</h4>
    
    ${availableStock <= 0
                ? '<span class="out-of-stock-label">Out of Stock</span>'
                : '<button class="btn add-btn">Add to Cart</button>'}
`;
const cardImage = card.querySelector(".card-image");
        cardImage.style.cursor = "pointer";
        cardImage.onclick = () => openQuickView(product.id);

        if (availableStock > 0) card.querySelector(".add-btn").onclick = () => addToCart(product);
        cardList.appendChild(card);
    });
};

// ================= LISTENERS =================
filterButtons.forEach(btn => {
    btn.onclick = () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        showCards(btn.dataset.filter);
    };
});

searchBar.oninput = (e) => { searchQuery = e.target.value; showCards(currentFilter); };
sortOptions.onchange = (e) => { sortType = e.target.value; showCards(currentFilter); };

const priceRange = document.getElementById("price-range");
if (priceRange) {
    priceRange.oninput = (e) => {
        maxPrice = parseFloat(e.target.value);
        document.getElementById("price-val").innerText = `$${maxPrice}`;
        showCards(currentFilter);
    };
}

const ratingSelect = document.getElementById("rating-select");
if (ratingSelect) {
    ratingSelect.onchange = (e) => { minRating = parseInt(e.target.value); showCards(currentFilter); };
}

// ================= CHECKOUT & TIMER (MERGED) =================
document.querySelector(".checkout-btn").onclick = (e) => {
    e.preventDefault();
    if (cartProduct.length === 0) return showToast("Your cart is empty!");

    const cl = document.querySelector(".cart-list");
    cl.innerHTML = `
        <div class="text-center">
            <h4>Processing...</h4>
            <div class="progress-container" style="display:block;">
                <div class="progress-bar" id="p-bar"></div>
            </div>
        </div>`;

    let width = 0;
    const interval = setInterval(() => {
        width += 25;
        const pb = document.getElementById("p-bar");
        if (pb) pb.style.width = width + "%";
        if (width >= 100) {
            clearInterval(interval);
            completeOrder();
        }
    }, 800);
};

let timerInterval;
const startDeliveryTimer = (durationInMinutes) => {
    let timer = durationInMinutes * 60;
    const display = document.getElementById("delivery-timer");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let min = Math.floor(timer / 60), sec = timer % 60;
        display.textContent = `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
        if (--timer < 0) { clearInterval(timerInterval); display.textContent = "Arrived!"; showToast("Food has arrived! 🍔"); }
    }, 1000);
};

const completeOrder = () => {
    playSound("success");

    // --- PEHLE BILL CALCULATE KAREIN ---
    let subtotal = 0;
    cartProduct.forEach(item => subtotal += item.quantity * item.price);
    let discountAmt = (subtotal * discountPercent) / 100;
    let finalBill = subtotal - discountAmt;

    localStorage.setItem("last_order_receipt", JSON.stringify(cartProduct));

    // --- AB HISTORY SAVE KAREIN ---
    let orderHistory = JSON.parse(localStorage.getItem("all_orders")) || [];
    const currentOrder = {
        date: new Date().toLocaleString(),
        items: [...cartProduct], // Copy of cart
        total: finalBill
    };
    orderHistory.unshift(currentOrder);
    localStorage.setItem("all_orders", JSON.stringify(orderHistory));

    // --- UI UPDATES (Receipt & Modal) ---
    const summaryList = document.getElementById("order-summary-list");
    if(summaryList) {
        summaryList.innerHTML = cartProduct.map(item => 
            `<div style="display:flex; justify-content:space-between;">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${(item.quantity * item.price).toFixed(2)}</span>
            </div>`
        ).join("");
    }

    // Confetti Logic
    if (typeof confetti === 'function') {
        var duration = 5 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };
        function randomInRange(min, max) { return Math.random() * (max - min) + min; }
        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            var particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    document.getElementById("order-status-modal").style.display = "flex";
    startDeliveryTimer(25);

    // --- WALLET LOGIC ---
    if (walletBalance >= finalBill) {
        walletBalance -= finalBill;
        localStorage.setItem("guest_wallet", walletBalance);
        if(typeof updateWalletDisplay === 'function') updateWalletDisplay();
        showToast("Paid from Wallet! 💳");
    } else {
        showToast("Wallet balance low, used Cash on Delivery!");
    }

    updateOrderStats();

    // --- CLEANUP ---
    cartProduct = [];
    saveCart();
    renderCart();
    showCards(currentFilter);
    cartTab.classList.remove("cart-tab-active");
    document.body.classList.remove("cart-open");
};
const closeStatusModal = () => { document.getElementById("order-status-modal").style.display = "none"; };

// ================= PROMO & LOCATION =================
document.getElementById("apply-promo").onclick = () => {
    const code = document.getElementById("promo-input").value.toUpperCase();
    const msg = document.getElementById("promo-msg");
    if (appliedPromo === code) return showToast("Code already applied!");
    if (code === "SAVE10" || code === "FOODIE20") {
        discountPercent = (code === "SAVE10") ? 10 : 20;
        appliedPromo = code;
        msg.innerText = `${discountPercent}% Applied!`;
        msg.style.color = "green";
    } else {
        discountPercent = 0; appliedPromo = "";
        msg.innerText = "Invalid Code!"; msg.style.color = "red";
    }
    updateTotals();
};

document.getElementById("get-location").onclick = () => {
    const display = document.getElementById("address-display");
    if (navigator.geolocation) {
        display.innerText = "Fetching location...";
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                display.innerText = `📍 ${data.display_name.split(',').slice(0, 3).join(',')}`;
                showToast("Location captured!");
            } catch (err) { display.innerText = `Lat: ${latitude.toFixed(2)}, Long: ${longitude.toFixed(2)}`; }
        }, () => showToast("Permission denied!"));
    }
};

// ================= RATING HANDLER =================
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("rating-star")) {
        const productId = parseInt(e.target.dataset.id);
        const ratingValue = parseInt(e.target.dataset.value);
        const product = productlist.find(p => p.id === productId);
        if (product) {
            product.rating = ratingValue;
            showCards(currentFilter);
            localStorage.setItem("foodie_products", JSON.stringify(productlist));
            showToast(`You rated ${product.name} ${ratingValue} stars!`);
        }
    }
});

// ================= RECEIPT DOWNLOAD =================

const downloadReceipt = () => {
    if (!window.jspdf) {
        showToast("PDF Library not loaded!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = 20;

    // IMPORTANT FIX: Match the key with completeOrder function
    let itemsToPrint = JSON.parse(localStorage.getItem("last_order_receipt")) || [];

    if (itemsToPrint.length === 0) {
        showToast("No order details found!");
        return;
    }

    // --- Header ---
    doc.setFontSize(24);
    doc.setTextColor(255, 165, 0); // Orange color
    doc.setFont("helvetica", "bold");
    doc.text("FOODIE EXPRESS", 105, yPos, { align: "center" });

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, yPos);
    doc.text(`Invoice No: #INV-${Math.floor(Math.random() * 100000)}`, 140, yPos);

    yPos += 8;
    doc.setDrawColor(200);
    doc.line(20, yPos, 190, yPos); // Border line

    // --- Table Headers ---
    yPos += 12;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Item Name", 20, yPos);
    doc.text("Qty", 100, yPos);
    doc.text("Price", 135, yPos);
    doc.text("Total", 170, yPos);

    yPos += 5;
    doc.line(20, yPos, 190, yPos);

    // --- Items Loop ---
    doc.setFont("helvetica", "normal");
    let subtotal = 0;

    itemsToPrint.forEach(item => {
        yPos += 10;
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;

        doc.text(item.name, 20, yPos);
        doc.text(item.quantity.toString(), 105, yPos);
        doc.text(`$${item.price.toFixed(2)}`, 135, yPos);
        doc.text(`$${itemTotal.toFixed(2)}`, 170, yPos);

        // Page break logic
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
    });

    // --- Summary Section ---
    yPos += 15;
    doc.line(20, yPos, 190, yPos);

    yPos += 12;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    // Discount check (agar global variable available ho)
    let discountAmt = (typeof discountPercent !== 'undefined') ? (subtotal * discountPercent) / 100 : 0;
    let finalTotal = subtotal - discountAmt;

    if (discountAmt > 0) {
        doc.setFontSize(11);
        doc.setTextColor(150, 0, 0);
        doc.text(`Discount:`, 135, yPos);
        doc.text(`-$${discountAmt.toFixed(2)}`, 170, yPos);
        yPos += 8;
    }

    doc.setFontSize(16);
    doc.setTextColor(220, 0, 0); // Red for Grand Total
    doc.text("Grand Total:", 120, yPos);
    doc.text(`$${finalTotal.toFixed(2)}`, 170, yPos);

    // --- Footer ---
    yPos += 25;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for ordering with Foodie Express!", 105, yPos, { align: "center" });
    doc.text("Visit us again for more delicious food.", 105, yPos + 6, { align: "center" });

    // Download PDF
    doc.save("Foodie_Receipt.pdf");
};

// 1. Wishlist mein sirf number badalne ke liye (DOM manipulation)
window.changeWishQty = (id, delta) => {
    const qtySpan = document.getElementById(`qty-${id}`);
    let currentQty = parseInt(qtySpan.innerText);
    currentQty += delta;
    if (currentQty < 1) currentQty = 1;
    qtySpan.innerText = currentQty;
};

// 2. Final Quantity ke saath cart mein bhejne ke liye
window.addFromWishlist = (id) => {
    const product = productlist.find(p => p.id === id);
    const finalQty = parseInt(document.getElementById(`qty-${id}`).innerText);
    
    if (product) {
        // Hum loop chalayenge jitni quantity user ne select ki hai
        for(let i = 0; i < finalQty; i++) {
            addToCart(product);
        }
        showToast(`${finalQty} x ${product.name} added! 🛒`);
    }
};

// Modal kholne ke liye
window.openQuickView = (id) => {
    const product = productlist.find(p => p.id === id);
    if (product) {
        // Basic Info fill karein
        document.getElementById("modal-img").src = product.image;
        document.getElementById("modal-name").innerText = product.name;
        document.getElementById("modal-item-name-inline").innerText = product.name;
        document.getElementById("modal-price").innerText = `$${product.price.toFixed(2)}`;
        
        // --- INGREDIENTS UPDATE (SIRF EK LINE) ---
        // Ye seedha aapke naye id="modal-ingredients" wale span mein data dalega
        document.getElementById("modal-ingredients").innerText = product.ingredients || "Fresh Produce, House Special Sauce, Organic Herbs";

        // Veg/Non-Veg Badge Logic
        const badge = document.getElementById("modal-badge");
        if(product.category.includes("Non-Veg")) {
            badge.innerText = "Non-Veg";
            badge.style.background = "#ffebee";
            badge.style.color = "#c62828";
        } else {
            badge.innerText = "Veg";
            badge.style.background = "#e8f5e9";
            badge.style.color = "#2e7d32";
        }

        // Star Rating Display
        let stars = "";
        for(let i=1; i<=5; i++) {
            stars += `<i class="fa-${i <= (product.rating || 4) ? 'solid' : 'regular'} fa-star"></i>`;
        }
        document.getElementById("modal-stars-display").innerHTML = stars + " (Customer Choice)";

        // Modal dikhayein
        const modal = document.getElementById("quick-view-modal");
        modal.style.display = "flex";

        document.getElementById("modal-add-btn").onclick = () => {
            addToCart(product);
            closeQuickView();
        };
    }
};

// Modal band karne ke liye
window.closeQuickView = () => {
    document.getElementById("quick-view-modal").style.display = "none";
};

// Mobile menu links par click hone par menu band karne ke liye
const mobileLinks = document.querySelectorAll(".mobile-menu li a");

mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
        // Menu hide karo
        mobileMenu.classList.remove("mobile-menu-active");
        
        // Bars icon ko wapas hamburger banao
        const icon = bars.querySelector("i");
        if (icon) {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
        
        // Body scroll enable karo (agar lock ki hai)
        document.body.style.overflow = "auto";
    });
});

// App Progress Notification
window.appComingSoon = () => {
    // Aapka existing toast function use ho raha hai
    showToast("Our mobile app is under development. Stay tuned! 🚀");
    
    // Optional: Button text temporarily change karna
    const appBtn = document.querySelector("#about .btn");
    const originalText = appBtn.innerHTML;
    
    appBtn.innerHTML = "<i class='fa-solid fa-hourglass-start'></i> &nbsp; Coming Soon...";
    setTimeout(() => {
        appBtn.innerHTML = originalText;
    }, 3000);
};

window.toggleProfile = () => {
    const profileTab = document.getElementById("profile-tab");
    const overlay = document.getElementById("profile-overlay");
    
    profileTab.classList.toggle("active");
    
    // Overlay show/hide logic
    if (profileTab.classList.contains("active")) {
        overlay.style.display = "block";
        document.body.style.overflow = "hidden";
    } else {
        overlay.style.display = "none";
        document.body.style.overflow = "auto";
    }
};

window.changeGuestName = () => {
    const newName = prompt("Enter your name:");
    
    if (newName && newName.trim() !== "") {
        // 1. Sidebar name update
        const sidebarName = document.getElementById("guest-name-sidebar");
        if(sidebarName) sidebarName.innerText = newName;

        // 2. Avatar first letter update
        const avatar = document.getElementById("main-avatar");
        if(avatar) avatar.innerText = newName.charAt(0).toUpperCase();

        // 3. Navbar name update (Search for your nav span)
        const navName = document.querySelector(".user-profile-wrapper span");
        if(navName) navName.innerText = newName;

        // 4. Save to storage (Optional but good)
        localStorage.setItem("guest_name", newName);

        showToast(`Welcome, ${newName}! ✨`);
    }
};

// Refresh hone par naam wapas lane ke liye ye logic (initApp mein ya window.onload mein daal sakte hain)
const savedName = localStorage.getItem("guest_name");
if(savedName) {
    setTimeout(() => {
        if(document.getElementById("guest-name-sidebar")) {
            document.getElementById("guest-name-sidebar").innerText = savedName;
            document.getElementById("main-avatar").innerText = savedName.charAt(0).toUpperCase();
        }
    }, 500);
}

window.updateGuestStats = () => {
    currentPoints += 10; // Har bar 10 points add honge
    localStorage.setItem("guest_points", currentPoints); // Browser mein save
    
    const pointsDisplay = document.getElementById("guest-points");
    if(pointsDisplay) {
        pointsDisplay.innerText = currentPoints;
        
        // Ek chota sa animation effect
        pointsDisplay.style.color = "#27ae60"; // Green color flash
        pointsDisplay.style.fontWeight = "bold";
        setTimeout(() => {
            pointsDisplay.style.color = "inherit";
        }, 500);
    }
};

// Wallet balance set karein (Memory se lo ya default $50.00)
let walletBalance = parseFloat(localStorage.getItem("guest_wallet")) || 50.00;

// Wallet ko update karne ka function
window.updateWalletDisplay = () => {
    const walletDisplay = document.getElementById("guest-wallet");
    if(walletDisplay) {
        walletDisplay.innerText = `$${walletBalance.toFixed(2)}`;
    }
};

window.showLastOrder = () => {
    const historyBox = document.getElementById("history-box");
    const historyContent = document.getElementById("history-content");
    const allOrders = JSON.parse(localStorage.getItem("all_orders")) || [];

    if (historyBox.style.display === "block") {
        historyBox.style.display = "none";
        return;
    }

    if (allOrders.length > 0) {
        historyBox.style.display = "block";
        // Max-height aur scrolling add ki hai
        historyContent.style.maxHeight = "300px";
        historyContent.style.overflowY = "auto";
        
        historyContent.innerHTML = allOrders.map((order, index) => `
            <div style="border-bottom: 2px dashed #eee; padding: 10px 0; margin-bottom: 5px;">
                <p style="font-size:0.7rem; color:#888; margin:0;">Order #${allOrders.length - index} • ${order.date}</p>
                ${order.items.map(item => `
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-top:3px;">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>$${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                `).join("")}
                <div style="text-align:right; font-weight:bold; margin-top:5px; color:#27ae60; font-size:0.9rem;">Total Paid: $${order.total.toFixed(2)}</div>
            </div>
        `).join("");
    } else {
        showToast("No history found! 🍕");
    }
};

window.updateOrderStats = () => {
    const allOrders = JSON.parse(localStorage.getItem("all_orders")) || [];
    const orderCountDisplay = document.getElementById("guest-orders-count");
    
    if (orderCountDisplay) {
        orderCountDisplay.innerText = allOrders.length;
    }
};

window.handleLogout = () => {
    
    const confirmReset = confirm("Are you sure you want to log out? This will reset all your guest data, including your wallet and order history.");
    
    if (confirmReset) {
        localStorage.clear();
        showToast("Session cleared successfully! 🔄");
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
};

window.handleSubscribe = () => {
    const emailInput = document.getElementById("newsletter-email");
    const emailValue = emailInput.value.trim();

    // Basic Email Validation
    if (emailValue === "" || !emailValue.includes("@")) {
        showToast("Please enter a valid email address! ❌");
        return;
    }

    // --- REWARD LOGIC ---
    // User ko subscribe karne par 50 points extra milenge
    currentPoints += 50; 
    localStorage.setItem("guest_points", currentPoints);
    
    // Sidebar update karein (agar points wala function exist karta hai)
    if (typeof updateGuestStats === 'function') {
        updateGuestStats();
    }

    // Success Effects
    showToast("Successfully Subscribed! +50 Points Added 🎁");
    
    // Confetti for Celebration
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#FFD700', '#000000'] // Aapki Gold & Black theme
        });
    }

    // Input clear kar dein
    emailInput.value = "";
};

// ================= INITIALIZATION =================
const showToast = (msg) => {
    let toast = document.querySelector(".toast-msg") || document.createElement("div");
    toast.className = "toast-msg show";
    
    // Inline Style for Z-Index (Overlay ke upar laane ke liye)
    toast.style.zIndex = "20000"; 
    
    toast.innerHTML = `<i class="fa-solid fa-bell"></i> ${msg}`;
    if (!document.querySelector(".toast-msg")) document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("show"), 2500);
};

const initApp = () => {
    cardList.innerHTML = Array(6).fill('<div class="skeleton"></div>').join("");
    
    // --- SAVED NAME LOGIC (Already fixed) ---
    const savedName = localStorage.getItem("guest_name");
    if (savedName) {
        if(document.getElementById("guest-name-sidebar")) document.getElementById("guest-name-sidebar").innerText = savedName;
        if(document.getElementById("main-avatar")) document.getElementById("main-avatar").innerText = savedName.charAt(0).toUpperCase();
    }

    // InitApp ke andar:
const savedWallet = localStorage.getItem("guest_wallet");
if (savedWallet) {
    walletBalance = parseFloat(savedWallet);
}
updateWalletDisplay(); 
updateOrderStats();// Isse refresh par wallet balance update ho jayega

    // --- POINTS REFRESH FIX (Yahan add karein) ---
    const savedPoints = localStorage.getItem("guest_points");
    if (savedPoints) {
        const pointsDisplay = document.getElementById("guest-points");
        if(pointsDisplay) pointsDisplay.innerText = savedPoints;
        // Global variable ko bhi update karein taaki counting sahi rahe
        currentPoints = parseInt(savedPoints); 
    }

    // ... baaki ka fetch logic ...
    const savedProducts = localStorage.getItem("foodie_products");
    fetch("products.json")
        .then(res => res.json())
        .then(data => {
            productlist = savedProducts ? JSON.parse(savedProducts) : data;
            setTimeout(() => { showCards("All"); loadCart(); initSwiper(); }, 1000);
        });
};
window.onload = initApp;