document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursorDot.className = 'custom-cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const smoothness = 0.15; // Adjust this value for cursor smoothness (0-1)

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update dot position immediately
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    function animate() {
        // Smooth follow for main cursor
        cursorX += (mouseX - cursorX) * smoothness;
        cursorY += (mouseY - cursorY) * smoothness;
        
        cursor.style.transform = `translate3d(${cursorX - cursor.offsetWidth/2}px, ${cursorY - cursor.offsetHeight/2}px, 0px)`;
        
        requestAnimationFrame(animate);
    }
    animate();

    // Add hover effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .glass-card, .key-responsibility-tag, [role="button"]');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorDot.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorDot.classList.remove('hover');
        });
    });
}); 