// ===== CUSTOM CURSOR LOGIC =====
const cursorDot = document.getElementById('cursor-dot');
const cursorCross = document.getElementById('cursor-cross');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Track mouse position natively
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Snap dot exactly to cursor
    if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }
});

// Animate the crosshair with a slight delay/easing (lerp)
let crossX = mouseX;
let crossY = mouseY;

function animateCursor() {
    crossX += (mouseX - crossX) * 0.2;
    crossY += (mouseY - crossY) * 0.2;
    
    if (cursorCross) {
        cursorCross.style.left = `${crossX}px`;
        cursorCross.style.top = `${crossY}px`;
        
        // Add rotation based on movement speed
        const dx = mouseX - crossX;
        const dy = mouseY - crossY;
        const speed = Math.sqrt(dx*dx + dy*dy);
        cursorCross.style.transform = `translate(-50%, -50%) rotate(${speed * 2}deg)`;
    }
    
    requestAnimationFrame(animateCursor);
}

// Start cursor loop only if not touch device
if (window.matchMedia("(pointer: fine)").matches) {
    animateCursor();
}

// Hover effects for all interactive elements to enlarge the dot
const interactables = document.querySelectorAll('a, button, .brutal-tag, .brutal-project-card');

interactables.forEach(item => {
    item.addEventListener('mouseenter', () => {
        cursorDot.style.width = '60px';
        cursorDot.style.height = '60px';
        cursorDot.style.mixBlendMode = 'difference';
        cursorDot.style.background = '#fff';
        
        cursorCross.style.opacity = '0';
    });
    
    item.addEventListener('mouseleave', () => {
        cursorDot.style.width = '24px';
        cursorDot.style.height = '24px';
        cursorDot.style.mixBlendMode = 'normal';
        cursorDot.style.background = 'var(--brutal-red)';
        
        cursorCross.style.opacity = '1';
    });
});

// Need to click buttons natively without cursor eating the event
// We fixed this by adding `pointer-events: none` to the cursors in CSS.

// ===== MARQUEE CLONING FIX =====
// To make CSS flex marquees infinite and seamless, you usually duplicate the content inside.
const tracks = document.querySelectorAll('.marquee-track, .marquee-track-fast');

tracks.forEach(track => {
    // Clone its innerHTML once to ensure it loops smoothly
    const content = track.innerHTML;
    track.innerHTML = content + content;
});
