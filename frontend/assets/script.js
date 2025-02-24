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
        loginForm.addEventListener("submit", handleLogin);
    }

    function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageElement = document.getElementById('loginMessage');

        // Simple validation
        if (!username || !password) {
            showFormMessage('Please fill in all fields', 'error');
            return false;
        }

        // Here you would typically make an API call to your backend
        // For demo purposes, we'll use a simple check
        if (username === 'demo' && password === 'demo123') {
            showFormMessage('Login successful! Redirecting...', 'success');
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showFormMessage('Invalid username or password', 'error');
        }

        return false;
    }

    function showFormMessage(message, type) {
        const messageElement = document.getElementById('loginMessage');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `form-message ${type}`;
        }
    }

    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const logoutBtn = document.getElementById('logout');
        const loginBtn = document.querySelector('a[href="login.html"]');

        if (isLoggedIn) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
                logoutBtn.addEventListener('click', handleLogout);
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    function handleLogout(event) {
        event.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'login.html';
    }

    checkLoginStatus();

    // Menu items data with local images
    const menuData = {
        "Butter Chicken": {
            price: 320,
            description: "Creamy, rich curry with tender chicken pieces",
            image: "assets/images/menu/butter-chicken.jpg",
            category: "non-veg"
        },
        "Paneer Tikka": {
            price: 280,
            description: "Grilled cottage cheese with spices",
            image: "assets/images/menu/paneer-tikka.jpg",
            category: "veg"
        },
        "Dal Makhani": {
            price: 220,
            description: "Creamy black lentils cooked overnight",
            image: "assets/images/menu/dal-makhani.jpg",
            category: "veg"
        },
        "Chicken Biryani": {
            price: 350,
            description: "Fragrant rice with tender chicken and aromatic spices",
            image: "assets/images/menu/chicken-biryani.jpg",
            category: "non-veg"
        },
        "Malai Kofta": {
            price: 260,
            description: "Soft potato dumplings in rich creamy gravy",
            image: "assets/images/menu/malai-kofta.jpg",
            category: "veg"
        },
        "Tandoori Roti": {
            price: 40,
            description: "Whole wheat bread baked in tandoor",
            image: "assets/images/menu/tandoori-roti.jpg",
            category: "veg"
        }
    };

    const menuContainer = document.getElementById("menuContainer");
    const cartSidebar = document.getElementById('cartSidebar');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCart = document.querySelector('.close-cart');

    let cart = [];

    function displayMenuItems(category = 'all') {
        if (!menuContainer) return;
        
        menuContainer.innerHTML = "";
        Object.entries(menuData).forEach(([name, details]) => {
            if (category === 'all' || details.category === category) {
                const menuItem = document.createElement("div");
                menuItem.classList.add("menu-item", "animate__animated", "animate__fadeIn");
                menuItem.setAttribute('data-category', details.category);
                
                menuItem.innerHTML = `
                    <div class="menu-item-image">
                        <div class="image-placeholder">
                            <div class="loading-spinner"></div>
                        </div>
                        <img src="${details.image}" 
                             alt="${name}" 
                             loading="lazy" 
                             onload="this.parentElement.querySelector('.image-placeholder').style.display='none'"
                             onerror="this.src='assets/images/menu/placeholder.jpg'">
                    </div>
                    <div class="menu-item-content">
                        <h3>${name}</h3>
                        <p class="description">${details.description}</p>
                        <p class="price">₹${details.price}</p>
                        <button class="add-to-cart-btn" onclick="addToCart({
                            id: '${name.replace(/\s+/g, '_')}',
                            name: '${name}',
                            price: ${details.price}
                        })">
                            <i class="fas fa-cart-plus"></i>
                            Add to Cart
                        </button>
                    </div>
                `;
                
                menuContainer.appendChild(menuItem);
            }
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayMenuItems(btn.dataset.category);
        });
    });

    function addToCart(item) {
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        updateCart();
        showCartSidebar();
    }

    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        updateCart();
    }

    function updateQuantity(itemId, delta) {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(itemId);
            }
        }
        updateCart();
    }

    function updateCart() {
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items display
        if (cartItems) {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price} x ${item.quantity}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
            `).join('');
        }

        // Update summary
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05;
        const delivery = subtotal > 0 ? 40 : 0;
        const total = subtotal + tax + delivery;

        document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('delivery').textContent = `₹${delivery}`;
        document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
    }

    function showCartSidebar() {
        cartSidebar.style.right = '0';
    }

    function hideCartSidebar() {
        cartSidebar.style.right = '-400px';
    }

    cartIcon.addEventListener('click', showCartSidebar);
    closeCart.addEventListener('click', hideCartSidebar);

    displayMenuItems();
    updateCart();

    // Cart functionality
    function addToCart(item) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        showMessage(`${item.name} added to cart!`, 'success');
        updateCartDisplay();
    }

    function updateCartDisplay() {
        const cartCount = document.querySelector(".cart-count");
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems || '';
            cartCount.style.display = totalItems ? 'flex' : 'none';
        }

        // Update cart page if we're on it
        const cartItems = document.getElementById("cart-items");
        const cartSummary = document.querySelector(".cart-summary");
        const emptyCart = document.getElementById("empty-cart");
        
        if (cartItems && emptyCart) {
            if (cart.length === 0) {
                cartItems.parentElement.style.display = 'none';
                cartSummary.style.display = 'none';
                emptyCart.style.display = 'flex';
            } else {
                cartItems.parentElement.style.display = 'block';
                cartSummary.style.display = 'block';
                emptyCart.style.display = 'none';
                
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <div class="item-details">
                            <h3>${item.name}</h3>
                            <p class="price">₹${item.price}</p>
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, -1)">−</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <p class="item-total">₹${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})"></button>
                    </div>
                `).join('');
                
                updateCartSummary();
            }
        }
    }

    function updateCartSummary() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const subtotalElement = document.getElementById("subtotal");
        const taxElement = document.getElementById("tax");
        const deliveryElement = document.getElementById("delivery");
        const totalElement = document.getElementById("total");

        if (subtotalElement && taxElement && deliveryElement && totalElement) {
            const subtotal = cart.reduce((sum, item) => {
                return sum + (parseFloat(item.price) * parseInt(item.quantity));
            }, 0);
            
            const tax = subtotal * 0.05; // 5% tax
            const delivery = subtotal > 0 ? 40 : 0; // ₹40 delivery fee if cart not empty
            const total = subtotal + tax + delivery;

            subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
            taxElement.textContent = `₹${tax.toFixed(2)}`;
            deliveryElement.textContent = `₹${delivery.toFixed(2)}`;
            totalElement.textContent = `₹${total.toFixed(2)}`;

            // Update checkout button state
            const checkoutBtn = document.getElementById("checkout-btn");
            if (checkoutBtn) {
                checkoutBtn.disabled = subtotal === 0;
                checkoutBtn.style.opacity = subtotal === 0 ? "0.5" : "1";
            }
        }
    }

    function updateQuantity(itemId, change) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity = Math.max(0, cart[itemIndex].quantity + change);
            if (cart[itemIndex].quantity === 0) {
                cart.splice(itemIndex, 1);
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartDisplay();
        }
    }

    function removeFromCart(itemId) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const newCart = cart.filter(item => item.id !== itemId);
        localStorage.setItem("cart", JSON.stringify(newCart));
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

    updateCartDisplay();

    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            const addressForm = document.getElementById("address-form");
            if (!addressForm.checkValidity()) {
                alert("Please fill in all required delivery details!");
                return;
            }

            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            // Here you would typically send the order to your backend
            alert("Order placed successfully! 🎉");
            localStorage.removeItem("cart");
            window.location.href = "index.html";
        });
    }

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

    // Dark Mode Toggle
    function initThemeToggle() {
        const themeSwitch = document.createElement('button');
        themeSwitch.className = 'theme-switch';
        themeSwitch.innerHTML = '';
        document.body.appendChild(themeSwitch);

        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeSwitch.innerHTML = currentTheme === 'light' ? '' : '';

        themeSwitch.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeSwitch.innerHTML = newTheme === 'light' ? '' : '';
            
            showToast('Theme changed! ', 'success');
        });
    }

    // Toast Notifications
    function initToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    function showToast(message, type = 'success') {
        const container = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            ${type === 'success' ? '' : ''}
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Back to Top Button
    function initBackToTop() {
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.innerHTML = '';
        document.body.appendChild(backToTop);

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Loading Spinner
    function showLoading() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(spinner);
        setTimeout(() => spinner.classList.add('show'), 0);
    }

    function hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.classList.remove('show');
            setTimeout(() => spinner.remove(), 300);
        }
    }

    // Initialize Features
    initThemeToggle();
    initToastContainer();
    initBackToTop();

    // Add loading animation for page transitions
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (!link.getAttribute('href').startsWith('#')) {
                showLoading();
            }
        });
    });

    // Add form submission handlers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showLoading();
            setTimeout(() => {
                hideLoading();
                showToast('Form submitted successfully! ', 'success');
                form.reset();
            }, 1000);
        });
    });

    // Parallax effect for hero section
    document.addEventListener("scroll", () => {
        const hero = document.querySelector(".hero[data-parallax]");
        if (hero) {
            const scrollPosition = window.scrollY;
            hero.style.backgroundPositionY = `${-scrollPosition * 0.3}px`;
        }
    });
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
                showToast("Coupon applied successfully! Price reduced by ₹20. 🎉", 'success');
            } else {
                showToast("Invalid coupon code! 😔", 'error');
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
                showToast("Order placed successfully! Thank you for choosing Zayka. 🚚🎉", 'success');
                localStorage.removeItem("cart"); // Clear cart after order
                displayCart(); // Update cart display
            } else {
                showToast("Your cart is empty! 🛒😔", 'error');
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
    loginForm.addEventListener("submit", handleLogin);
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('loginMessage');

    // Simple validation
    if (!username || !password) {
        showFormMessage('Please fill in all fields', 'error');
        return false;
    }

    // Here you would typically make an API call to your backend
    // For demo purposes, we'll use a simple check
    if (username === 'demo' && password === 'demo123') {
        showFormMessage('Login successful! Redirecting...', 'success');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showFormMessage('Invalid username or password', 'error');
    }

    return false;
}

function showFormMessage(message, type) {
    const messageElement = document.getElementById('loginMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
    }
}

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const logoutBtn = document.getElementById('logout');
    const loginBtn = document.querySelector('a[href="login.html"]');

    if (isLoggedIn) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.addEventListener('click', handleLogout);
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

checkLoginStatus();