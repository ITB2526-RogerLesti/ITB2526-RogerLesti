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
    const bio = document.querySelector('.bio-text');
    if (!bio) return;

    const originalText = bio.innerText;
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    let iterations = 0;

    const interval = setInterval(() => {
        bio.innerText = bio.innerText.split("")
            .map((char, index) => {
                if (index < iterations) return originalText[index];
                return characters[Math.floor(Math.random() * characters.length)];
            })
            .join("");

        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 3;
    }, 30);
}

// Llama a esta función dentro de tu DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initDecryptEffect();
});