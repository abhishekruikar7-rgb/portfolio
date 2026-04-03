/* ===== GEOMETRIC 3D CUBE & HUD ENGINE ===== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 3D CUBE PARTICLE ENGINE
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    
    let w, h;
    const particles = [];
    const particleCount = 200;
    const cubeSize = 120;
    let cubeState = 'NORMAL'; // NORMAL, EXPLODE
    let angleX = 0, angleY = 0;

    function initCanvas() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
    }
    initCanvas();
    window.addEventListener('resize', initCanvas);

    // Cube Edges Definition (Pairing vertices 0-7)
    const vertices = [
        {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1},
        {x: 1, y: 1, z: -1}, {x: -1, y: 1, z: -1},
        {x: -1, y: -1, z: 1}, {x: 1, y: -1, z: 1},
        {x: 1, y: 1, z: 1}, {x: -1, y: 1, z: 1}
    ];
    const edges = [
        [0,1], [1,2], [2,3], [3,0], // back
        [4,5], [5,6], [6,7], [7,4], // front
        [0,4], [1,5], [2,6], [3,7]  // connectors
    ];

    class Particle {
        constructor() {
            // Assign to a random edge
            const edge = edges[Math.floor(Math.random() * edges.length)];
            this.v1 = vertices[edge[0]];
            this.v2 = vertices[edge[1]];
            this.t = Math.random(); // Position along the edge
            
            // Local 3D target coordinates
            this.lx = (this.v1.x + (this.v2.x - this.v1.x) * this.t) * cubeSize;
            this.ly = (this.v1.y + (this.v2.y - this.v1.y) * this.t) * cubeSize;
            this.lz = (this.v1.z + (this.v2.z - this.v1.z) * this.t) * cubeSize;

            this.x = (Math.random() - 0.5) * w;
            this.y = (Math.random() - 0.5) * h;
            this.z = (Math.random() - 0.5) * 500;
            
            this.vx = 0; this.vy = 0; this.vz = 0;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? '#22d3ee' : '#fff';
        }

        update() {
            // 3D Rotation Math
            let rx = this.lx;
            let ry = this.ly * Math.cos(angleX) - this.lz * Math.sin(angleX);
            let rz = this.ly * Math.sin(angleX) + this.lz * Math.cos(angleX);

            let finalX = rx * Math.cos(angleY) + rz * Math.sin(angleY);
            let finalY = ry;
            let finalZ = -rx * Math.sin(angleY) + rz * Math.cos(angleY);

            if (cubeState === 'NORMAL') {
                const dx = finalX - this.x;
                const dy = finalY - this.y;
                const dz = finalZ - this.z;
                
                this.vx += dx * 0.04;
                this.vy += dy * 0.04;
                this.vz += dz * 0.04;
                
                this.vx *= 0.9;
                this.vy *= 0.9;
                this.vz *= 0.9;
            } else {
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.vz *= 0.98;
            }

            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
        }

        draw() {
            // Perspective Projection
            const fov = 400;
            const perspective = fov / (fov + this.z);
            const px = this.x * perspective + w / 2;
            const py = this.y * perspective + h / 2;
            const ps = this.size * perspective;

            if (px < 0 || px > w || py < 0 || py > h) return;

            ctx.beginPath();
            ctx.arc(px, py, ps, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = perspective; 
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    canvas.addEventListener('mousedown', () => {
        cubeState = 'EXPLODE';
        particles.forEach(p => {
            p.vx = (Math.random() - 0.5) * 50;
            p.vy = (Math.random() - 0.5) * 50;
            p.vz = (Math.random() - 0.5) * 50;
        });
        setTimeout(() => { cubeState = 'NORMAL'; }, 1000);
    });

    function animate() {
        ctx.clearRect(0, 0, w, h);
        
        angleX += 0.005;
        angleY += 0.008;

        particles.sort((a, b) => b.z - a.z); // Depth Sort

        particles.forEach(p => {
            p.update();
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
        if (posDisplay) posDisplay.textContent = `${clientX.toFixed(1)}, ${clientY.toFixed(1)}`;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = (clientX - centerX) / 100;
        const moveY = (clientY - centerY) / 100;

        blobs.forEach((blob, index) => {
            blob.style.transform = `translate(${moveX * (index + 1)}px, ${moveY * (index + 1)}px)`;
        });

        if (heroContent && heroGrid) {
            const rotX = (clientY - centerY) / -180;
            const rotY = (clientX - centerX) / 180;
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
            const sec = document.getElementById(id);
            if (sec && sec.getBoundingClientRect().top <= 150) current = id.toUpperCase();
        });
        if (hudNavTag) hudNavTag.textContent = `// AR_SYSTEM : ${current}`;
    });

    // HUD LOG DATA
    const logStream = document.getElementById('log-stream');
    const logMessages = ['> ARCHITECTING_VECTORS', '> STRUCTURAL_INTEGRITY: OK', '> SYNCING_GEOMETRY', '> 3D_RENDER_PIPELINE: ACTIVE', '> CORE_SYMMETRY: STABLE'];
    setInterval(() => {
        if (!logStream) return;
        const entry = document.createElement('div');
        entry.textContent = logMessages[Math.floor(Math.random() * logMessages.length)];
        logStream.prepend(entry);
        if (logStream.children.length > 5) logStream.removeChild(logStream.lastChild);
    }, 4000);

    const vBars = document.querySelectorAll('.v-bar');
    setInterval(() => {
        vBars.forEach(bar => bar.style.height = Math.random() * 80 + 20 + '%');
    }, 1500);

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
