// Red Hawks Cyber Security Research Lab - Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
    // Dynamic time display
    function updateTime() {
        const now = new Date('2025-02-21T16:26:33+06:00');
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Dhaka'
            });
        }
    }

    // Navigation hover effects
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.color = '#f56565';
        });
        link.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.color = '';
        });
    });

    // Webinar registration simulation
    const registerButton = document.querySelector('a[href="#"]');
    if (registerButton) {
        registerButton.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Webinar registration is coming soon! Stay tuned.');
        });
    }

    // Initial time update
    updateTime();
});