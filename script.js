/* ===== INTERACTIVE NEURAL NETWORK & HUD ENGINE ===== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. NEURAL NETWORK ENGINE (PARTICLES + LINES)
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    
    let w, h;
    const particles = [];
    const particleCount = 100; // Balanced for line drawing performance
    const connectionDist = 120;

    function initCanvas() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
    }
    initCanvas();
    window.addEventListener('resize', initCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? '#0ea5e9' : '#8b5cf6';
        }

        update(mouseX, mouseY, shock) {
            // SHOCKWAVE (REPULSION ON CLICK)
            if (shock) {
                const dx = this.x - shock.x;
                const dy = this.y - shock.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 250) {
                    const force = (250 - dist) / 15;
                    this.vx += (dx / dist) * force;
                    this.vy += (dy / dist) * force;
                }
            }

            // MOUSE ATTRACTION
            if (mouseX !== undefined) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 300) {
                    this.vx += dx / 2500;
                    this.vy += dy / 2500;
                }
            }

            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.98;
            this.vy *= 0.98;

            // Boundary Bounce
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < connectionDist) {
                    const alpha = 1 - dist / connectionDist;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(14, 165, 233, ${alpha * 0.3})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let currentMouseX, currentMouseY, shockPoint = null;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        shockPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setTimeout(() => shockPoint = null, 300);
    });

    function animate() {
        ctx.clearRect(0, 0, w, h);
        drawConnections();
        particles.forEach(p => {
            p.update(currentMouseX, currentMouseY, shockPoint);
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();

    // HUD & SCROLL HANDLERS
    const progressBar = document.getElementById('scroll-bar');
    const hudNavTag = document.getElementById('hud-nav-tag');
    const posDisplay = document.getElementById('pos-display');
    const heroContent = document.querySelector('.hero-content');
    const heroGrid = document.getElementById('hero-grid');
    const blobs = document.querySelectorAll('.mesh-blob');

    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const rect = canvas.getBoundingClientRect();
        currentMouseX = clientX - rect.left;
        currentMouseY = clientY - rect.top;

        if (posDisplay) posDisplay.textContent = `${clientX.toFixed(1)}, ${clientY.toFixed(1)}`;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (clientX - centerX) / 50;
        const moveY = (clientY - centerY) / 50;

        blobs.forEach((blob, index) => {
            blob.style.transform = `translate(${moveX * (index + 1)}px, ${moveY * (index + 1)}px)`;
        });

        if (heroContent && heroGrid) {
            const rotX = (clientY - centerY) / -120;
            const rotY = (clientX - centerX) / 120;
            heroContent.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            heroGrid.style.transform = `translate(-50%, -50%) rotateX(${60 + rotX}deg) rotateY(${rotY}deg)`;
        }
    });

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) progressBar.style.width = scrolled + "%";

        const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
        let current = 'ROOT';
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section && section.getBoundingClientRect().top <= 150) current = id.toUpperCase();
        });
        if (hudNavTag) hudNavTag.textContent = `// AR_SYSTEM : ${current}`;
    });

    const logStream = document.getElementById('log-stream');
    const logMessages = ['> NEURAL_LINK_ESTABLISHED', '> SYNCING_NODES', '> AI_CORE_ACTIVE', '> MAPPING_NETWORK', '> DATA_UPLINK_ON'];
    setInterval(() => {
        if (!logStream) return;
        const entry = document.createElement('div');
        entry.textContent = logMessages[Math.floor(Math.random() * logMessages.length)];
        logStream.prepend(entry);
        if (logStream.children.length > 6) logStream.removeChild(logStream.lastChild);
    }, 4000);

    const vBars = document.querySelectorAll('.v-bar');
    setInterval(() => {
        vBars.forEach(bar => bar.style.height = Math.random() * 80 + 20 + '%');
    }, 1200);

    // SECTION REVEAL INTERSECTION OBSERVER
    const sectionsToReveal = document.querySelectorAll('.section-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.querySelectorAll('.reveal-up').forEach(i => i.classList.add('active'));
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    sectionsToReveal.forEach(s => revealObserver.observe(s));

    // INITIAL HERO ACTIVATION
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.classList.add('active');
        heroSection.querySelectorAll('.reveal-up').forEach(i => i.classList.add('active'));
    }

});

// Injecting Mobile Nav styles if not in CSS
if (!document.getElementById('mobile-nav-style')) {
    const style = document.createElement('style');
    style.id = 'mobile-nav-style';
    style.innerHTML = `
        @media (max-width: 1024px) {
            .nav-links.active {
                display: flex !important;
                flex-direction: column;
                position: fixed;
                top: 90px;
                left: 0;
                width: 100%;
                background: var(--bg-deep);
                padding: 40px;
                border-bottom: 2px solid var(--accent-blue);
                z-index: 999;
                animation: slideIn 0.4s ease forwards;
            }
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        }
    `;
    document.head.appendChild(style);
}
