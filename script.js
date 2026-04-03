/* ===== PARTICLE CUBE IDENTITIY & HUD ENGINE ===== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. PARTICLE ENGINE (3D CUBE)
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    
    let w, h;
    const particles = [];
    const particleCount = 400;
    const cubeSize = 140;

    function initCanvas() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
    }
    
    initCanvas();
    window.addEventListener('resize', initCanvas);

    class Particle {
        constructor() {
            this.id = Math.random();
            // Initial random pos
            this.x = (Math.random() - 0.5) * 1000;
            this.y = (Math.random() - 0.5) * 1000;
            this.z = (Math.random() - 0.5) * 1000;
            
            // Generate Target on Cube Edges
            const side = Math.floor(Math.random() * 3);
            const edge1 = (Math.random() - 0.5) * cubeSize;
            const edge2 = (Math.random() - 0.5) * cubeSize;
            const edge3 = Math.random() > 0.5 ? cubeSize / 2 : -cubeSize / 2;

            if (side === 0) { this.tx = edge3; this.ty = edge1; this.tz = edge2; }
            else if (side === 1) { this.tx = edge1; this.ty = edge3; this.tz = edge2; }
            else { this.tx = edge1; this.ty = edge2; this.tz = edge3; }

            this.vx = 0; this.vy = 0; this.vz = 0;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? '#0ea5e9' : '#8b5cf6';
        }

        update(mouseX, mouseY, angle) {
            // Apply 3D Rotation to Target (Auto Rotate)
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            // X-Axis Rotation
            let ty = this.ty * cos - this.tz * sin;
            let tz = this.ty * sin + this.tz * cos;
            // Y-Axis Rotation
            let tx = this.tx * cos + tz * sin;
            tz = -this.tx * sin + tz * cos;

            // Physics (Move to Target)
            const dx = tx - this.x;
            const dy = ty - this.y;
            const dz = tz - this.z;

            this.vx += dx * 0.05;
            this.vy += dy * 0.05;
            this.vz += dz * 0.05;

            // Mouse Repulsion
            if (mouseX !== undefined) {
                // Project mouse to 3D roughly
                const mdx = (mouseX - w/2) - (this.x); 
                const mdy = (mouseY - h/2) - (this.y);
                const dist = Math.sqrt(mdx*mdx + mdy*mdy);
                if (dist < 80) {
                    this.vx -= mdx * 0.2;
                    this.vy -= mdy * 0.2;
                }
            }

            this.vx *= 0.85;
            this.vy *= 0.85;
            this.vz *= 0.85;

            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
        }

        draw() {
            // 3D to 2D Projection
            const perspective = 400 / (400 + this.z);
            const px = this.x * perspective + w / 2;
            const py = this.y * perspective + h / 2;
            const ps = this.size * perspective;

            if (px < 0 || px > w || py < 0 || py > h) return;

            ctx.beginPath();
            ctx.arc(px, py, ps, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = perspective; // Depth effect
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let angle = 0;
    let currentMouseX, currentMouseY;

    function animate() {
        ctx.clearRect(0, 0, w, h);
        angle += 0.005;

        particles.sort((a, b) => b.z - a.z); // Depth Sort

        particles.forEach(p => {
            p.update(currentMouseX, currentMouseY, angle);
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();

    // HUD & MOUSE PARALLAX
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

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // HUD Position update
        if (posDisplay) {
            posDisplay.textContent = `${clientX.toFixed(1)}, ${clientY.toFixed(1)}`;
        }

        // Parallax & Tilt
        const moveX = (clientX - centerX) / 50;
        const moveY = (clientY - centerY) / 50;

        blobs.forEach((blob, index) => {
            blob.style.transform = `translate(${moveX * (index + 1)}px, ${moveY * (index + 1)}px)`;
        });

        if (heroContent && heroGrid) {
            const rotX = (clientY - centerY) / -100;
            const rotY = (clientX - centerX) / 100;
            heroContent.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            heroGrid.style.transform = `translate(-50%, -50%) rotateX(${60 + rotX}deg) rotateY(${rotY}deg)`;
        }
    });

    // SCROLL HUD
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";

        const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
        let current = 'ROOT';
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section.getBoundingClientRect().top <= 150) current = id.toUpperCase();
        });
        hudNavTag.textContent = `// AR_SYSTEM : ${current}`;
    });

    // HUD LOG DATA
    const logStream = document.getElementById('log-stream');
    const logMessages = ['> CUBE_LOADED', '> SYNCING_VECTORS', '> AI_CORE_ACTIVE', '> DRAW_PIPELINE_OK', '> DATA_STREAM_UP'];
    setInterval(() => {
        if (!logStream) return;
        const entry = document.createElement('div');
        entry.textContent = logMessages[Math.floor(Math.random() * logMessages.length)];
        logStream.prepend(entry);
        if (logStream.children.length > 6) logStream.removeChild(logStream.lastChild);
    }, 3000);

    setInterval(() => {
        vBars.forEach(bar => bar.style.height = Math.random() * 80 + 20 + '%');
    }, 1000);

    // 4. SECTION REVEAL INTERSECTION OBSERVER
    const sectionsToReveal = document.querySelectorAll('.section-reveal');
    const revealOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.querySelectorAll('.reveal-up').forEach(i => i.classList.add('active'));
            }
        });
    }, revealOptions);

    sectionsToReveal.forEach(s => revealObserver.observe(s));

    // 5. INITIAL HERO ACTIVATION
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
