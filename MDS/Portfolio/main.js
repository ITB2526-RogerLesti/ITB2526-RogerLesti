// main.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. Actualització automàtica de l'any al peu de pàgina
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // 2. Intersection Observer per a Project Cards (Animació Fade-in)
    const projectCards = document.querySelectorAll('.project-card');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Deixa d'observar després de l'animació
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1 // Es dispara quan el 10% de l'element és visible
    });

    projectCards.forEach(card => {
        observer.observe(card);
    });

    // 3. Efecte Màquina d'Esciure (Typewriter) per al títol principal
    const mainTitle = document.querySelector('h1[data-typewriter]');
    if (mainTitle) {
        const textToType = mainTitle.getAttribute('data-typewriter');
        mainTitle.textContent = ''; // Buidar el text inicial
        let i = 0;

        function typeWriter() {
            if (i < textToType.length) {
                mainTitle.textContent += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 50); // Velocitat de tecleig
            } else {
                 mainTitle.style.borderRight = 'none';
            }
        }

        // Simular un cursor abans de començar
        mainTitle.style.borderRight = '4px solid var(--color-accent)';
        mainTitle.style.display = 'inline-block';

        setTimeout(typeWriter, 500); // Iniciar l'efecte amb un retard
    }

    // 4. Smooth Scroll per a enllaços interns (millora UX)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

});

// Crear la barra de progreso dinámicamente
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: var(--color-accent);
    width: 0%;
    z-index: 1000;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

// Actualizar el ancho según el scroll
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
});

/* ==========================================================
   SISTEMA DE GLITCH DINÁMICO - ROGER LESTI .LAB
   ========================================================== */

function applyCyberGlitch() {
    // Seleccionamos todas las imágenes dentro de las tarjetas de proyecto
    const images = document.querySelectorAll('.project-card img');

    if (images.length === 0) return;

    // Función que ejecuta el efecto de forma impredecible
    const glitchEvent = () => {
        // Elegimos una imagen al azar de las disponibles
        const target = images[Math.floor(Math.random() * images.length)];

        // Guardamos el estilo original para restaurarlo
        const originalStyle = target.style.filter;
        const originalTransform = target.style.transform;

        // --- INICIO DEL FALLO (GLITCH) ---
        // Cambiamos el color (hue-rotate), brillo y aplicamos un desplazamiento brusco
        target.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(1.4) contrast(1.5)`;
        target.style.transform = `translateX(${Math.random() * 10 - 5}px) scaleY(${1 + Math.random() * 0.1})`;
        target.style.opacity = "0.8";

        // Tras 60 milisegundos, restauramos la imagen a su estado original
        setTimeout(() => {
            target.style.filter = originalStyle;
            target.style.transform = originalTransform;
            target.style.opacity = "1";
        }, 60);

        // Programamos el siguiente fallo en un tiempo aleatorio (entre 1.5 y 4 segundos)
        setTimeout(glitchEvent, Math.random() * 2500 + 1500);
    };

    // Iniciamos el bucle
    glitchEvent();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', applyCyberGlitch);

// 1. CONTADOR DE UPTIME (TIEMPO DE SESIÓN)
function initUptimeCounter() {
    const uptimeElement = document.createElement('div');
    uptimeElement.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #64FFDA;
        background: rgba(10, 25, 47, 0.7);
        padding: 5px 10px;
        border: 1px solid #64FFDA;
        z-index: 100;
    `;
    document.body.appendChild(uptimeElement);

    let seconds = 0;
    setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        uptimeElement.textContent = `UPTIME: ${mins}m ${secs}s`;
    }, 1000);
}

// 2. RASTREADOR DE COORDENADAS EN PROYECTOS
function initCoordinatesTracker() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        const coordDisplay = document.createElement('div');
        coordDisplay.style.cssText = `
            font-size: 10px;
            color: #8892b0;
            margin-top: 5px;
            font-family: monospace;
        `;
        card.appendChild(coordDisplay);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            coordDisplay.textContent = `SCAN_POS: [X:${x} Y:${y}]`;
        });

        card.addEventListener('mouseleave', () => {
            coordDisplay.textContent = '';
        });
    });
}

// 3. EFECTO DE ESCANEO AL APARECER (INTERSECTION OBSERVER)
function initScanReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                entry.target.style.filter = "blur(0px)";
                entry.target.style.transition = "all 0.8s ease-out";
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.project-card').forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.filter = "blur(5px)";
        observer.observe(card);
    });
}

// Iniciar todos los nuevos sistemas
document.addEventListener('DOMContentLoaded', () => {
    initUptimeCounter();
    initCoordinatesTracker();
    initScanReveal();
});

function initDecryptEffect() {
    // Seleccionamos el contenedor bio-text
    const bio = document.querySelector('.bio-text');
    if (!bio) return;

    // IMPORTANTE: Buscamos todos los párrafos dentro para descifrarlos todos
    const paragraphs = bio.querySelectorAll('p');

    paragraphs.forEach(p => {
        const originalText = p.innerText;
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
        let iterations = 0;

        const interval = setInterval(() => {
            p.innerText = p.innerText.split("")
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return characters[Math.floor(Math.random() * characters.length)];
                })
                .join("");

            if (iterations >= originalText.length) {
                clearInterval(interval);
            }

            // Velocidad ultra rápida: 3 letras por ciclo
            iterations += 3;
        }, 20);
    });
}

// Aseguramos que se ejecute al cargar la página
window.addEventListener('load', initDecryptEffect);

/* LISTADO COMPLETO DE PROYECTOS - CONFIGURACIÓN CYBER ADMIN */
const projectsData = [
    // --- 1. PROYECTOS REALES (Categorías Biology y Asix) ---
    {
        title: "MICROORGANISMS RESEARCH",
        subtitle: "Biology Department",
        category: "biology",
        tags: ["RESEARCH", "LAB"],
        img: "micro.jpg",
        url: "detall_projecte_1.html",
        active: true
    },
    {
        title: "PREVENTION PLAN",
        subtitle: "Network & Security",
        category: "asix",
        tags: ["SAFETY", "ASIX"],
        img: "prevention.png",
        url: "detall_projecte_2.html",
        active: true
    },

    // --- 2. PROYECTOS CON IMÁGENES LOCALES (Categoría Web) ---
    {
        title: "Games",
        subtitle: "Videojoc Web",
        category: "web",
        tags: ["JAVASCRIPT", "LOGIC"],
        img: "games.png",
        url: "#",
        active: false
    },
    {
        title: "Maths",
        subtitle: "Calculadora / UI",
        category: "web",
        tags: ["HTML", "CSS"],
        img: "Maths.jpg",
        url: "#",
        active: false
    },
    {
        title: "Modern Landing",
        subtitle: "Disseny Web",
        category: "web",
        tags: ["FIGMA", "WEB"],
        img: "modernlearning.webp",
        url: "#",
        active: false
    },
    {
        title: "ECO",
        subtitle: "Data & AI",
        category: "web",
        tags: ["REACT", "DATA"],
        img: "eco.jpg",
        url: "#",
        active: false
    },
    {
        title: "Darwin",
        subtitle: "Evolutionary UI",
        category: "web",
        tags: ["SECURITY", "LINUX"],
        img: "darwin.webp",
        url: "#",
        active: false
    },
    {
        title: "Proxy_Phantom",
        subtitle: "Secure VPN Tunnel",
        category: "web",
        tags: ["NETWORK", "PRIVACY"],
        img: "phantom.png",
        url: "#",
        active: false
    },

    // --- 3. PROYECTOS CON FOTOS AUTOMÁTICAS (Categoría Web) ---
    {
        title: "Youtube",
        subtitle: "Video Content Analysis",
        category: "web",
        tags: ["MEDIA", "UI"],
        img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
        url: "#",
        active: false
    },
    {
        title: "Bit Coin",
        subtitle: "Decryption System",
        category: "web",
        tags: ["CRYPTO", "ALGO"],
        img: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
        url: "#",
        active: false
    },
    {
        title: "Biology",
        subtitle: "Microbial Scan",
        category: "web",
        tags: ["DNA", "LAB"],
        img: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
        url: "#",
        active: false
    },
    {
        title: "ITB",
        subtitle: "Institut Tecnològic Barcelona",
        category: "web",
        tags: ["EDUCATION", "CODE"],
        img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
        url: "#",
        active: false
    },
    {
        title: "Spain",
        subtitle: "Geo-Location Data",
        category: "web",
        tags: ["REGION", "MAP"],
        img: "spain.png",
        url: "#",
        active: false
    },
    {
        title: "Twitch",
        subtitle: "Live Stream Portal",
        category: "web",
        tags: ["STREAM", "LIVE"],
        img: "twitch.jpg",
        url: "#",
        active: false
    },
    {
        title: "PC Gamer",
        subtitle: "Hardware Setup",
        category: "web",
        tags: ["RGB", "GAMING"],
        img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
        url: "#",
        active: false
    },
    {
        title: "Packet Tracer",
        subtitle: "Network Systems",
        category: "web",
        tags: ["CISCO", "DATA"],
        img: "tracer.png",
        url: "#",
        active: false
    }
];

/* FUNCIÓN PARA RENDERIZAR LA GALERÍA */
function renderGallery(filter = "tots") {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = projectsData.filter(p => filter === "tots" || p.category === filter);

    filtered.forEach(p => {
        const cardContent = `
            <div class="gallery-img-container">
                <img src="${p.img}" alt="${p.title}">
            </div>
            <div class="gallery-info">
                <h3>${p.title}</h3>
                <p class="subtitle">${p.subtitle}</p>
                <div class="tags-container">
                    ${p.tags.map(t => `<span class="tag-pill">${t}</span>`).join("")}
                </div>
                ${!p.active ? '<div class="locked-status">[SYSTEM_LOCKED]</div>' : ''}
            </div>
        `;

        const card = document.createElement('div');
        if (p.active) {
            card.innerHTML = `<a href="${p.url}" class="project-gallery-card active-link">${cardContent}</a>`;
        } else {
            card.className = "project-gallery-card locked";
            card.innerHTML = cardContent;
        }
        grid.appendChild(card);
    });
}

/* CARGA INICIAL Y EVENTOS */
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderGallery(btn.dataset.filter);
        });
    });
});