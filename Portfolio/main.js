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