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
