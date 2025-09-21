document.addEventListener('DOMContentLoaded', () => {
    // Smooth Scroll Implementation
    const exploreBtn = document.getElementById('explore-btn');
    
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mainSection = document.getElementById('main-section');
            
            if (mainSection) {
                // Use window.scrollTo for more consistent smooth scrolling
                const targetPosition = mainSection.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });

        // Simple hover effect without scaling
        exploreBtn.addEventListener('mouseenter', () => {
            exploreBtn.style.opacity = '0.8';
        });

        exploreBtn.addEventListener('mouseleave', () => {
            exploreBtn.style.opacity = '1';
        });
    }

    // Dynamic Glassmorphism Effect for Cards
    const glassCards = document.querySelectorAll('.glass-card');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });

        // Add subtle hover effect
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'rgba(250, 0, 111, 0.5)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'rgba(250, 0, 111, 0.2)';
        });
    });

    // Responsive Grid Adjustment
    function adjustGridLayout() {
        const mainSection = document.querySelector('#main-section .grid');
        
        if (window.innerWidth < 768) {
            mainSection.classList.remove('md:grid-cols-5');
            mainSection.classList.add('grid-cols-1');
        } else {
            mainSection.classList.add('md:grid-cols-5');
            mainSection.classList.remove('grid-cols-1');
        }
    }

    // Initial layout adjustment and add resize listener
    adjustGridLayout();
    window.addEventListener('resize', adjustGridLayout);
});

document.addEventListener('DOMContentLoaded', () => {
    const projectCountEl = document.querySelector('.project-count');
    const targetCount = parseInt(projectCountEl.getAttribute('data-target'));
    
    function animateCount(el, target) {
        let current = 0;
        const increment = target / 100;
        
        const updateCount = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.round(current);
                requestAnimationFrame(updateCount);
            } else {
                el.textContent = target;
            }
        };
        
        updateCount();
    }
    
    animateCount(projectCountEl, targetCount);
});
