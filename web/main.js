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