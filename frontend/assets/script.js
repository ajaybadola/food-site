document.addEventListener("DOMContentLoaded", () => {
    // Background image handling
    const sections = ['section1', 'section2', 'section3'];
    let currentSection = 0;

    function updateBackground() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;

        currentSection = Math.floor((scrollPercentage / 100) * sections.length);
        sections.forEach((section, index) => {
            const bg = document.getElementById(section);
            if (bg) {
                bg.style.opacity = index === currentSection ? '0.15' : '0';
            }
        });
    }

    // Add background sections to the body
    sections.forEach(section => {
        const bg = document.createElement('div');
        bg.id = section;
        bg.className = 'bg-section';
        document.body.prepend(bg);
    });

    window.addEventListener('scroll', updateBackground);
    updateBackground();

    // Login form handling
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            if (username && password) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", username);
                window.location.href = "menu.html";
            } else {
                showMessage("Please fill in all fields", "error");
            }
        });
    }

    // Menu items display and filtering
    const menuContainer = document.getElementById("menu-items");
    let allMenuItems = [];

    if (menuContainer) {
        fetch("/api/menu")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                allMenuItems = data;
                displayMenuItems(data);
            })
            .catch(error => {
                console.error("Error fetching menu:", error);
                menuContainer.innerHTML = "<p>Error loading menu items. Please try again.</p>";
            });
    }

    // Category filtering
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            filterMenuItems(category);
        });
    });

    function filterMenuItems(category) {
        if (!allMenuItems.length) return;

        let filteredItems = allMenuItems;
        if (category !== 'all') {
            filteredItems = allMenuItems.filter(item => {
                if (category === 'veg') {
                    return !item.name.toLowerCase().includes('chicken') && 
                           !item.name.toLowerCase().includes('mutton');
                } else if (category === 'non-veg') {
                    return item.name.toLowerCase().includes('chicken') || 
                           item.name.toLowerCase().includes('mutton');
                }
                return true;
            });
        }
        displayMenuItems(filteredItems);
    }

    function displayMenuItems(items) {
        if (!menuContainer) return;
        
        menuContainer.innerHTML = "";
        items.forEach(item => {
            const menuItem = document.createElement("div");
            menuItem.classList.add("menu-item", "animate__animated", "animate__fadeIn");
            menuItem.innerHTML = `
                <h3>${item.name}</h3>
                <p class="description">${item.description || ''}</p>
                <p class="price">₹${item.price}</p>
                <button class="add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                    Add to Cart 🛒
                </button>
            `;
            menuContainer.appendChild(menuItem);
        });
    }

    // Cart functionality
    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        showMessage(`${item.name} added to cart!`, 'success');
        updateCartDisplay();
    }

    // Add event listeners to "Add to Cart" buttons
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart")) {
            if (checkLogin()) {
                const button = e.target;
                const item = {
                    id: button.getAttribute("data-id"),
                    name: button.getAttribute("data-name"),
                    price: parseFloat(button.getAttribute("data-price")),
                    quantity: 1
                };
                addToCart(item);
            }
        }
    });

    function checkLogin() {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (!isLoggedIn) {
            showMessage("Please log in first!", 'error');
            window.location.href = "login.html";
            return false;
        }
        return true;
    }

    function updateCartDisplay() {
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems || '';
        }
    }

    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }

    // Initialize cart display
    updateCartDisplay();

    // Fetch menu items from the backend
    fetch("/api/menu")
        .then(response => response.json())
        .then(data => {
            const menuContainer = document.getElementById("menu-items");
            menuContainer.innerHTML = "";
            data.forEach(item => {
                const menuItem = document.createElement("div");
                menuItem.classList.add("menu-item", "animate__animated", "animate__fadeIn");
                menuItem.innerHTML = `
                    <h3>${item.name}</h3>
                    <p class="description">${item.description || ''}</p>
                    <p class="price">₹${item.price}</p>
                    <button class="add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                        Add to Cart 
                    </button>
                `;
                menuContainer.appendChild(menuItem);
            });

            // Add event listeners to "Add to Cart" buttons after they’re created
            const addToCartButtons = document.querySelectorAll(".add-to-cart");
            addToCartButtons.forEach(button => {
                button.addEventListener("click", () => {
                    if (checkLogin()) {
                        const item = {
                            id: button.getAttribute("data-id"),
                            name: button.getAttribute("data-name"),
                            price: parseFloat(button.getAttribute("data-price")),
                            quantity: 1
                        };
                        addToCart(item);
                    }
                });
            });
        })
        .catch(error => console.error("Error fetching menu:", error));

    // Function to add items to cart (stored in localStorage)
    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(item);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        showMessage(`${item.name} added to cart! `, 'success');
        updateCartDisplay();
    }

    // Function to update cart display (for menu page or a cart icon)
    function updateCartDisplay() {
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            cartCount.textContent = cart.length > 0 ? cart.length : "";
            cartCount.classList.add("animate__animated", "animate__bounceIn");
        }
    }

    // Function to display messages instead of popups
    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} animate__animated animate__fadeIn`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.classList.add("animate__fadeOut"), 2000);
        setTimeout(() => messageDiv.remove(), 3000);
    }

    // Initialize cart display when page loads
    updateCartDisplay();

    // Handle contact navigation
    const contactLink = document.querySelector('.contact-link');
    if (contactLink) {
        contactLink.addEventListener("click", (e) => {
            e.preventDefault();
            const contactSection = document.getElementById("contact");
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
                contactSection.classList.add("animate__animated", "animate__pulse");
                setTimeout(() => contactSection.classList.remove("animate__pulse"), 1000);
            }
        });
    }

    // Check login status on other pages
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginOrRegister = currentPath.includes("login.html") || currentPath.includes("register.html");
    if (!isLoginOrRegister) {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (!isLoggedIn) {
            showMessage("Please log in first! ", 'error');
            window.location.href = "login.html";
        }
    }
});

// Function to display cart on checkout.html
function displayCart() {
    const cartItems = document.querySelector(".cart-items");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty. </p>";
        return;
    }

    cartItems.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item animate__animated animate__fadeIn">
                <h3>${item.name}</h3>
                <p>Price: ₹${item.price}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease animate__animated animate__pulse" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase animate__animated animate__pulse" data-id="${item.id}">+</button>
                </div>
                <button class="remove-item btn animate__animated animate__pulse" data-id="${item.id}">Remove 🗑️</button>
            </div>
        `;
    }).join("");

    // Add coupon input and apply button
    cartItems.innerHTML += `
        <div class="coupon-section animate__animated animate__fadeIn">
            <input type="text" id="couponCode" placeholder="Enter coupon code" class="input animate__animated animate__bounceIn">
            <button id="applyCoupon" class="btn animate__animated animate__pulse">Apply Coupon 🎟️</button>
        </div>
        <p>Total (before coupon): ₹${total.toFixed(2)}</p>
    `;

    // Apply coupon logic
    const applyCouponButton = document.getElementById("applyCoupon");
    if (applyCouponButton) {
        applyCouponButton.addEventListener("click", () => {
            const couponCode = document.getElementById("couponCode").value.toUpperCase();
            if (couponCode === "AJAY50") {
                total -= 20; // Reduce price by 20 rupees
                cartItems.innerHTML += `<p class="success animate__animated animate__fadeIn">Total (after coupon): ₹${total.toFixed(2)}</p>`;
                showMessage("Coupon applied successfully! Price reduced by ₹20. 🎉", 'success');
            } else {
                showMessage("Invalid coupon code! 😔", 'error');
            }
        });
    }

    // Add event listeners for "Remove" buttons
    const removeButtons = document.querySelectorAll(".remove-item");
    removeButtons.forEach(button => {
        button.addEventListener("click", () => {
            removeFromCart(button.getAttribute("data-id"));
            displayCart(); // Re-render cart after removal
        });
    });

    // Add event listeners for quantity buttons
    const decreaseButtons = document.querySelectorAll(".decrease");
    const increaseButtons = document.querySelectorAll(".increase");

    decreaseButtons.forEach(button => {
        button.addEventListener("click", () => {
            adjustQuantity(button.getAttribute("data-id"), -1);
        });
    });

    increaseButtons.forEach(button => {
        button.addEventListener("click", () => {
            adjustQuantity(button.getAttribute("data-id"), 1);
        });
    });

    // Add event listener for Place Order button (without popup)
    const placeOrderButton = document.getElementById("placeOrder");
    if (placeOrderButton) {
        placeOrderButton.addEventListener("click", () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            if (cart.length > 0) {
                showMessage("Order placed successfully! Thank you for choosing Zayka. 🚚🎉", 'success');
                localStorage.removeItem("cart"); // Clear cart after order
                displayCart(); // Update cart display
            } else {
                showMessage("Your cart is empty! 🛒😔", 'error');
            }
        });
    }
}

// Function to remove items from cart
function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Function to adjust quantity
function adjustQuantity(itemId, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change); // Ensure quantity doesn’t go below 1
        if (item.quantity === 0) {
            cart = cart.filter(cartItem => cartItem.id !== itemId); // Remove if quantity reaches 0
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart(); // Re-render cart after adjustment
    }
}

// Call displayCart when checkout.html loads
if (document.querySelector(".cart-items")) {
    displayCart();
}

// Login and logout functionality
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const validUsername = "ajay";
        const validPassword = "password123";

        if (username === validUsername && password === validPassword) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            showMessage("Login successful! Redirecting to home... 🚀😊", 'success');
            window.location.href = "index.html";
        } else {
            showMessage("Invalid username or password! 😔", 'error');
        }
    });
}

// Parallax effect for hero section
document.addEventListener("scroll", () => {
    const hero = document.querySelector(".hero[data-parallax]");
    if (hero) {
        const scrollPosition = window.scrollY;
        hero.style.backgroundPositionY = `${-scrollPosition * 0.3}px`;
    }
});