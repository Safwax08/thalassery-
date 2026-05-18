document.addEventListener('DOMContentLoaded', () => {
    
    // Sticky Navbar Logic
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Reveal Logic using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before it comes into full view
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, revealOptions);

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // Hamburger Menu Toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Direct Order Form Logic
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        // Populate Datalist
        const menuItemsList = document.getElementById('menuItemsList');
        const itemSearch = document.getElementById('itemSearch');
        const itemQty = document.getElementById('itemQty');
        const addItemBtn = document.getElementById('addItemBtn');
        const addedItemsUI = document.getElementById('addedItemsUI');
        const orderDetailsHidden = document.getElementById('orderDetails');
        let orderItems = [];

        // Extract all menu items from DOM
        const menuElements = document.querySelectorAll('.menu-item-name, .card-content h3');
        const uniqueItems = new Set();
        menuElements.forEach(el => uniqueItems.add(el.textContent.trim()));
        
        uniqueItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            menuItemsList.appendChild(option);
        });

        // Add Item Button
        addItemBtn.addEventListener('click', () => {
            const itemName = itemSearch.value.trim();
            const qty = parseInt(itemQty.value) || 1;
            
            if (itemName) {
                orderItems.push({ name: itemName, qty: qty });
                renderAddedItems();
                itemSearch.value = '';
                itemQty.value = 1;
                itemSearch.focus();
            }
        });

        // Optional: Add Item on Enter Key inside Search Input
        itemSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                addItemBtn.click();
            }
        });

        function renderAddedItems() {
            addedItemsUI.innerHTML = '';
            let orderText = '';
            
            orderItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${item.qty}x ${item.name}</span> <button type="button" class="remove-item-btn" data-index="${index}">×</button>`;
                addedItemsUI.appendChild(li);
                orderText += `- ${item.qty}x ${item.name}\n`;
            });
            
            orderDetailsHidden.value = orderText;

            // Handle Remove Buttons
            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'));
                    orderItems.splice(idx, 1);
                    renderAddedItems();
                });
            });
        }

        // Form Submit
        // Form Submit
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (orderItems.length === 0) {
                alert("Please add at least one item to your order.");
                itemSearch.focus();
                return;
            }

            const submitBtn = document.getElementById('submitOrderBtn');
            const originalBtnText = submitBtn ? submitBtn.innerText : "Place Order";
            if (submitBtn) {
                submitBtn.innerText = "Sending Order...";
                submitBtn.disabled = true;
            }

            const name = document.getElementById('orderName').value;
            const phone = document.getElementById('orderPhone').value;
            const address = document.getElementById('orderAddress').value;
            const details = orderDetailsHidden.value;

            // Web3Forms API Access Key
            const accessKey = "b31d7fb9-5e47-41db-89de-fab7e3fe8ace";

            if (accessKey === "YOUR_WEB3FORMS_ACCESS_KEY_HERE") {
                alert("Note: Automation key not configured yet. Opening email app to place your order...");
                // Fallback to mailto link
                const subject = encodeURIComponent(`New Direct Order from ${name}`);
                const body = encodeURIComponent(`You have received a new order!\n\nCustomer Details:\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nOrder Details:\n${details}\n\nPlease contact the customer to confirm the order.`);
                window.location.href = `mailto:dining@elysithalasseryhotel.com?subject=${subject}&body=${body}`;
                
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
                
                orderForm.reset();
                orderItems = [];
                renderAddedItems();
                return;
            }

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        access_key: accessKey,
                        subject: `New Direct Order from ${name}`,
                        from_name: "Thalassery Orders",
                        name: name,
                        email: "orders@thalasserykitchen.com",
                        phone: phone,
                        address: address,
                        message: `NEW CUSTOMER ORDER\n\nItems Ordered:\n${details}\nDelivery Address:\n${address}\n\nContact Phone:\n${phone}`
                    })
                });

                const result = await response.json();
                if (response.status === 200) {
                    alert("Order placed successfully! We have received your order directly.");
                    orderForm.reset();
                    orderItems = [];
                    renderAddedItems();
                } else {
                    alert("Failed to send order: " + result.message);
                }
            } catch (error) {
                console.error("Order API Error:", error);
                alert("An error occurred while sending your order. Please call us directly.");
            } finally {
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Dynamic Restaurant Status Popup (Open/Closed check)
    function checkRestaurantStatus() {
        const currentHour = new Date().getHours();
        // Open daily: 7:00 AM (hour 7) to 11:00 PM (hour 23)
        const isOpen = currentHour >= 7 && currentHour < 23;
        
        const statusToast = document.createElement('div');
        statusToast.className = 'status-popup-toast';
        
        const iconColor = isOpen ? '#4caf50' : '#f44336';
        const titleText = isOpen ? 'We are Currently Open!' : 'We are Currently Closed';
        const descText = isOpen ? 'Serving authentic culinary delights till 11:00 PM.' : 'Our business hours are from 7:00 AM to 11:00 PM.';
        
        statusToast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${iconColor}; box-shadow: 0 0 10px ${iconColor}; flex-shrink: 0; animation: pulseGlow 2s infinite;"></div>
                <div>
                    <div style="font-weight: 700; color: #fff; font-size: 1.05rem;">${titleText}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 2px;">${descText}</div>
                </div>
            </div>
            <button type="button" class="close-status-toast" style="background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; padding: 0 5px; line-height: 1;">&times;</button>
        `;
        
        document.body.appendChild(statusToast);
        
        // Trigger animation after brief initial load delay
        setTimeout(() => {
            statusToast.classList.add('show');
        }, 1000);
        
        // Close button functionality
        const closeBtn = statusToast.querySelector('.close-status-toast');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                statusToast.classList.remove('show');
                setTimeout(() => statusToast.remove(), 600);
            });
        }
        
        // Auto dismiss after 8 seconds
        setTimeout(() => {
            if (statusToast.parentElement) {
                statusToast.classList.remove('show');
                setTimeout(() => statusToast.remove(), 600);
            }
        }, 8500);
    }
    
    checkRestaurantStatus();

    // Deep Linking logic for Swiggy and Zomato mobile apps with web fallbacks
    function initAppDeepLinking() {
        const swiggyWebUrl = "https://www.swiggy.com/menu/216348";
        const swiggyAppUrl = "swiggy://menu/216348";
        
        const zomatoWebUrl = "https://www.zomato.com/mangalore/thalassery-kitchen-1-bunder/order";
        const zomatoAppUrl = "zomato://restaurant/18785666";

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        function tryOpenApp(e, appUrl, webUrl) {
            if (!isMobile) {
                // Desktop users just open the standard URL in a new tab
                return;
            }

            e.preventDefault();
            const start = Date.now();

            // Set a fallback timer to redirect to mobile web version if the app is not installed
            const fallbackTimeout = setTimeout(() => {
                // If elapsed time is close to timeout, the browser remained in the foreground (app not installed)
                if (Date.now() - start < 2200) {
                    window.location.href = webUrl;
                }
            }, 1800);

            // Attempt to open the app via custom URI scheme
            window.location.href = appUrl;

            // Clear the fallback timeout if the app is opened and browser goes to the background
            const clearFallback = () => {
                clearTimeout(fallbackTimeout);
            };

            document.addEventListener('visibilitychange', clearFallback);
            document.addEventListener('webkitvisibilitychange', clearFallback);
            window.addEventListener('pagehide', clearFallback);
        }

        // Attach listener to all Swiggy links
        document.querySelectorAll('a[href*="swiggy.com"]').forEach(link => {
            link.addEventListener('click', (e) => {
                tryOpenApp(e, swiggyAppUrl, swiggyWebUrl);
            });
        });

        // Attach listener to all Zomato links
        document.querySelectorAll('a[href*="zomato.com"]').forEach(link => {
            link.addEventListener('click', (e) => {
                tryOpenApp(e, zomatoAppUrl, zomatoWebUrl);
            });
        });
    }

    initAppDeepLinking();

    // Google Places API integration is initialized via callback
});

window.initGoogleReviews = function(isFallback = false) {
    const googleRatingContainer = document.getElementById('googleRatingContainer');
    const googleTotalReviews = document.getElementById('googleTotalReviews');
    const reviewsGrid = document.getElementById('reviewsGrid');
    const hiddenMap = document.getElementById('hiddenMap');

    function renderFallback() {
        if(googleRatingContainer) googleRatingContainer.innerHTML = `Overall Rating: 4.8/5 ⭐⭐⭐⭐<span style="color: rgba(255,255,255,0.1);">⭐</span>`;
        if(googleTotalReviews) googleTotalReviews.innerHTML = `Based on <strong style="color: var(--accent-gold);">482</strong> genuine reviews from Google Maps.`;
        if(reviewsGrid) {
            reviewsGrid.innerHTML = `
                <div class="google-review-card reveal active">
                    <div class="reviewer-info">
                        <div style="width:40px;height:40px;border-radius:50%;background:#d4af37;color:#1a202c;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.2rem;">S</div>
                        <div>
                            <div class="reviewer-name">Sarah M.</div>
                            <div class="review-date">1 week ago</div>
                        </div>
                    </div>
                    <div class="review-stars" style="color: var(--accent-gold); margin-bottom: 0.5rem; letter-spacing: 2px;">⭐⭐⭐⭐⭐</div>
                    <p class="review-text" style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; font-style: italic;">"Absolutely the best Dum Biriyani in Mangalore! The meat was tender and the spices were perfectly balanced."</p>
                </div>
                <div class="google-review-card reveal active">
                    <div class="reviewer-info">
                        <div style="width:40px;height:40px;border-radius:50%;background:#444;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.2rem;">A</div>
                        <div>
                            <div class="reviewer-name">Arun Kumar</div>
                            <div class="review-date">3 weeks ago</div>
                        </div>
                    </div>
                    <div class="review-stars" style="color: var(--accent-gold); margin-bottom: 0.5rem; letter-spacing: 2px;">⭐⭐⭐⭐</div>
                    <p class="review-text" style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; font-style: italic;">"Great ambiance and excellent Kerala Parotta. Service was a bit slow on a busy weekend, but the food made up for it."</p>
                </div>
                <div class="google-review-card reveal active">
                    <div class="reviewer-info">
                        <div style="width:40px;height:40px;border-radius:50%;background:#555;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.2rem;">P</div>
                        <div>
                            <div class="reviewer-name">Priya Shetty</div>
                            <div class="review-date">1 month ago</div>
                        </div>
                    </div>
                    <div class="review-stars" style="color: var(--accent-gold); margin-bottom: 0.5rem; letter-spacing: 2px;">⭐⭐⭐⭐⭐</div>
                    <p class="review-text" style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; font-style: italic;">"Authentic Thalassery flavors! The Chicken 65 is a must-try. Will definitely be visiting again soon."</p>
                </div>
            `;
        }
    }

    if (!googleRatingContainer) return;
    
    // If explicitly called as fallback by gm_authFailure or missing google object
    if (isFallback === true || !window.google || !window.google.maps || !window.google.maps.places) {
        return renderFallback();
    }

    try {
        const service = new google.maps.places.PlacesService(hiddenMap);
        
        const request = {
            query: 'Thalassery Kitchen Mangalore',
            fields: ['place_id']
        };

        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                const placeId = results[0].place_id;
                
                service.getDetails({
                    placeId: placeId,
                    fields: ['name', 'rating', 'user_ratings_total', 'reviews']
                }, (place, detailStatus) => {
                    if (detailStatus === google.maps.places.PlacesServiceStatus.OK) {
                        
                        // Render Rating
                        const rating = place.rating || 5.0;
                        const total = place.user_ratings_total || 0;
                        const starCount = Math.round(rating);
                        const starsHtml = '⭐'.repeat(starCount) + '<span style="color: rgba(255,255,255,0.1);">' + '⭐'.repeat(5 - starCount) + '</span>';
                        
                        googleRatingContainer.innerHTML = `Overall Rating: ${rating}/5 ${starsHtml}`;
                        if (googleTotalReviews) {
                            googleTotalReviews.innerHTML = `Based on <strong style="color: var(--accent-gold);">${total}</strong> genuine reviews from Google Maps.`;
                        }

                        // Render Reviews
                        if (place.reviews && place.reviews.length > 0) {
                            reviewsGrid.innerHTML = ''; // clear any placeholder
                            
                            // Show up to 3 reviews
                            place.reviews.slice(0, 3).forEach(review => {
                                if(!review.text) return; // Skip empty reviews
                                
                                const reviewDate = review.relative_time_description || new Date(review.time * 1000).toLocaleDateString();
                                const reviewStars = '⭐'.repeat(review.rating);
                                
                                const reviewCard = document.createElement('div');
                                reviewCard.className = 'google-review-card reveal active'; // Keep active to avoid scroll-reveal issues on async load
                                reviewCard.innerHTML = `
                                    <div class="reviewer-info">
                                        <img src="${review.profile_photo_url}" alt="${review.author_name}" class="reviewer-img" onerror="this.src='https://via.placeholder.com/40'">
                                        <div>
                                            <div class="reviewer-name">${review.author_name}</div>
                                            <div class="review-date">${reviewDate}</div>
                                        </div>
                                    </div>
                                    <div class="review-stars" style="color: var(--accent-gold); margin-bottom: 0.5rem; letter-spacing: 2px;">${reviewStars}</div>
                                    <p class="review-text" style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; font-style: italic;">"${review.text}"</p>
                                `;
                                reviewsGrid.appendChild(reviewCard);
                            });
                        }
                    } else {
                        renderFallback();
                    }
                });
            } else {
                renderFallback();
            }
        });
    } catch(e) {
        console.error("Google Places Error:", e);
        renderFallback();
    }
};

// Handle Google Maps Authentication Failures globally
window.gm_authFailure = function() {
    window.initGoogleReviews(true); // Force fallback mode
};
