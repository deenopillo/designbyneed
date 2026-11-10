/* =========================================
   SOMMAIRE
1. VARIABLES GLOBALES ET SÉLECTION
   2. GESTION DE LA NAVIGATION ET DES PROJETS
   3. GESTION DE LA POP-UP (LIGHTBOX)
   4. LANCEMENT (ONLOAD)
   5. GESTION DU MENU PLEIN ÉCRAN
   6. GESTION DE LA PAGE CONTACT
   7. GESTION DU CLIC SUR LE LOGO
   8. GESTION DU LOADER (ÉCRAN D'ACCUEIL)
   9. SYSTÈME DE TICKET À GRATTER
   10. SYSTÈME ASSISTIVE TOUCH (iOS)
========================================= */

// =========================================
// VARIABLES GLOBALES
// =========================================
const couleursPages = [
    '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
    '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'
];

let currentPage = 0; // On commence bien à la page 0 (qui est la page 1 visuellement)
const itemsPerPage = 7; // Les 7 blocs du design

// Fonction utilitaire pour forcer la couleur de Safari et contrer le cache
function changerCouleurNavigateur(couleur, changerLeFond = true) {
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.remove());

    const nouvelleMeta = document.createElement('meta');
    nouvelleMeta.name = 'theme-color';
    nouvelleMeta.content = couleur;
    document.head.appendChild(nouvelleMeta);

    if (changerLeFond === true) {
        document.documentElement.style.setProperty('background-color', couleur, 'important');
        document.body.style.setProperty('background-color', couleur, 'important');
    }
}


// --- 1. SÉLECTION DE TOUS LES ÉLÉMENTS DE LA PAGE ---
const mainGrid = document.getElementById('main-portfolio-grid');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pagination = document.getElementById('pagination');

// Les éléments de la pop-up 
const lightbox = document.getElementById('lightbox');
const closeLightboxBtn = document.getElementById('close-lightbox-btn');
const lightboxMedia = document.getElementById('lightbox-media');
const lightboxDesc = document.getElementById('lightbox-description');


// --- 2. GESTION DE LA NAVIGATION ET DES PROJETS ---
// La fonction qui génère les blocs
function afficherProjets() {
    const couleurActuelle = couleursPages[currentPage] || '#FFFFFF';

    // Application de la couleur au body et au navigateur (TOUJOURS TRUE ICI)
    changerCouleurNavigateur(couleurActuelle, true);

    mainGrid.innerHTML = '';

    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    const projetsPage = projets.slice(start, end);

    projetsPage.forEach((projet, index) => {
        const item = document.createElement('div');
        item.classList.add('bento-item');

        // On donne la bonne position au bloc (1 à 7)
        item.classList.add('bento-pos-' + (index + 1));

        // Création de l'image
        const img = document.createElement('img');
        img.src = projet.mediaSrc;
        item.appendChild(img);

        // ⚠️ CORRECTION ICI : On insère l'élément dans la page AVANT de créer le canvas
        // pour que le script puisse calculer sa largeur et sa hauteur correctement !
        mainGrid.appendChild(item);

        // --- EFFET TICKET À GRATTER (SUR LA POS 4 / Index 3) ---
        if (index === 3) {
            // Le Canvas
            const canvas = document.createElement('canvas');
            canvas.classList.add('scratch-canvas');
            item.appendChild(canvas);

            // L'animation "Grattez-moi" superposée
            const promptDiv = document.createElement('div');
            promptDiv.classList.add('scratch-prompt');
            promptDiv.innerHTML = `
                <div class="vector vector-left">
                    <img src="images/E1 Vector.svg" alt="">
                </div>
                <span class="btn-text">grattez<br>moi</span>
                <div class="vector vector-right">
                    <img src="images/E2 Vector.svg" alt="">
                </div>
            `;
            item.appendChild(promptDiv);

            // Empêche la pop-up de s'ouvrir si on gratte
            let isDragging = false;
            canvas.addEventListener('mousedown', () => isDragging = false);
            canvas.addEventListener('mousemove', () => isDragging = true);
            canvas.addEventListener('click', (e) => {
                if (isDragging) e.stopPropagation();
            });

            // On initialise le grattage une fois l'image chargée
            if (img.complete) {
                initScratchCard(canvas, img, item, promptDiv);
            } else {
                img.addEventListener('load', () => initScratchCard(canvas, img, item, promptDiv));
            }
        }

        // Le clic sur l'image ouvre la popup SANS le texte (false)
        item.addEventListener('click', () => ouvrirPopup(projet, false));
    });

    // --- GESTION DE L'AFFICHAGE DU BOUTON iOS ---
    // Affiche le bouton Apple sur toutes les pages
    const assistiveBtn = document.getElementById('assistive-btn');
    if (assistiveBtn) {
        assistiveBtn.classList.remove('hidden');
    }

    // Cacher/Afficher la flèche gauche
    if (currentPage === 0) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }

    // La flèche droite reste toujours visible
    nextBtn.classList.remove('hidden');

    // On met à jour les numéros en bas
    afficherPagination();
}

// La fonction qui génère les numéros intelligemment (avec les "...")
function afficherPagination() {
    const totalPages = Math.ceil(projets.length / itemsPerPage);
    let pagesHtml = '';

    for (let i = 0; i < totalPages; i++) {
        // Condition pour n'afficher que : la 1ère page, la dernière, et les pages autour de la page active
        if (i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
            if (i === currentPage) {
                // Page actuelle : en évidence avec la couleur
                pagesHtml += `<span class="page-num active">${i + 1}</span>`;
            } else {
                // Autres pages : cliquables
                pagesHtml += `<span class="page-num" onclick="allerAPage(${i})">${i + 1}</span>`;
            }
        }
        // Si on est juste à côté des pages visibles, on met les points de suspension
        else if (i === currentPage - 2 || i === currentPage + 2) {
            pagesHtml += `<span class="page-dots">...</span>`;
        }
    }

    document.getElementById('pagination').innerHTML = pagesHtml;
}

// Fonction pour la navigation via les numéros
window.allerAPage = function (pageIndex) {
    currentPage = pageIndex;
    afficherProjets();
};

// Clics sur les flèches
nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(projets.length / itemsPerPage);
    currentPage++;

    if (currentPage >= totalPages) {
        currentPage = 0;
    }
    afficherProjets();
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        afficherProjets();
    }
});


// --- 3. GESTION DE LA POP-UP (LIGHTBOX) ---
function ouvrirPopup(projet, afficherTexte = false) {
    // 1. Charger l'image
    lightboxMedia.innerHTML = `<img src="${projet.mediaSrc}" alt="${projet.titre || 'Image projet'}">`;

    // 2. Traiter la description & le Markdown
    if (afficherTexte && (projet.description || projet.titre)) {
        lightbox.classList.add('has-text');
        let contentHtml = '';
        if (projet.titre) contentHtml += `<h2 class="project-main-title">${projet.titre}</h2>`;

        // --- NOUVEAU : Création des puces s'il y a des tags ---
        if (projet.tags && projet.tags.length > 0) {
            contentHtml += `<div class="project-tags">`;
            projet.tags.forEach(tag => {
                contentHtml += `<span class="project-tag">${tag}</span>`;
            });
            contentHtml += `</div>`;
        }

        if (projet.description) {
            if (typeof marked !== 'undefined') contentHtml += marked.parse(projet.description);
            else contentHtml += `<p>${projet.description.replace(/\n/g, '<br>')}</p>`;
        }
        lightboxDesc.innerHTML = contentHtml;
    } else {
        lightbox.classList.remove('has-text');
        lightboxDesc.innerHTML = '';
    }

    // 3. Afficher la popup et bloquer le fond
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // ⚠️ FALSE ICI : On change la couleur de la barre en gris foncé, mais on laisse le fond du site en blanc pour que le flou marche !
    changerCouleurNavigateur('#333333', false);
}

function fermerPopup() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = ''; // Rétablit le scroll

    // On remet le fond totalement blanc (ou la couleur de la page)
    const couleurPage = couleursPages[currentPage] || '#FFFFFF';
    changerCouleurNavigateur(couleurPage, true);
}

// Clic sur la croix de fermeture
if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fermerPopup();
    });
}

// Ferme la pop-up quand on clique sur le fond (autour de la carte)
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        fermerPopup();
    }
});

// Touche Échap pour fermer la pop-up
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
        fermerPopup();
    }
});


// --- 4. LANCEMENT ---
window.onload = () => {
    afficherProjets();
};


// --- 5. GESTION DU MENU PLEIN ÉCRAN ---
const fullscreenMenu = document.getElementById('fullscreen-menu');
const openMenuBtn = document.getElementById('open-menu-btn');
const menuGridElement = document.getElementById('menu-grid');
let menuTimeout; // Très important pour gérer le délai

function genererMenu() {
    menuGridElement.innerHTML = '';
    const totalPages = Math.ceil(projets.length / itemsPerPage);

    for (let i = 0; i < totalPages; i++) {
        const indexDeuxiemeProjet = (i * itemsPerPage) + 1;
        if (projets[indexDeuxiemeProjet]) {
            const projet = projets[indexDeuxiemeProjet];
            const item = document.createElement('div');
            item.classList.add('menu-item');

            const img = document.createElement('img');
            img.src = projet.mediaSrc;
            item.appendChild(img);

            item.addEventListener('click', () => {
                allerAPage(i);
                fermerMenu();
            });

            menuGridElement.appendChild(item);
        }
    }
}

function ouvrirMenu() {
    genererMenu();
    fullscreenMenu.classList.add('menu-ouvert');

    // 1. On VERROUILLE le fond du site en blanc tout de suite 
    // pour que l'accueil reste blanc pendant que le menu glisse.
    const couleurPage = couleursPages[currentPage] || '#FFFFFF';
    changerCouleurNavigateur(couleurPage, true);

    // 2. On annule l'ancien chrono s'il y en a un
    clearTimeout(menuTimeout);

    // 3. Après 800ms (fin du rebond), on colore UNIQUEMENT la barre Safari en rouge
    // FALSE ici pour ne pas peindre le body en rouge derrière le menu
    menuTimeout = setTimeout(() => {
        changerCouleurNavigateur('#FF0027', false);
    }, 800);
}

function fermerMenu() {
    fullscreenMenu.classList.remove('menu-ouvert');
    clearTimeout(menuTimeout);

    // On remet la page et les barres à leur couleur normale (TRUE)
    const couleurPage = couleursPages[currentPage] || '#FFFFFF';
    changerCouleurNavigateur(couleurPage, true);
}

openMenuBtn.addEventListener('click', ouvrirMenu);
document.getElementById('close-menu-btn').addEventListener('click', fermerMenu);

// --- 6. GESTION DE L'OUVERTURE / FERMETURE DE LA PAGE CONTACT ---
const contactPage = document.getElementById('contact-page');
const contactLink = document.querySelector('.contact-link');
const backToHomeBtn = document.getElementById('back-to-home-btn');

if (contactLink && contactPage && backToHomeBtn) {
    contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        contactPage.classList.remove('hidden');
        // TRUE car la page contact est 100% rouge
        changerCouleurNavigateur('#FF0027', true);
    });

    backToHomeBtn.addEventListener('click', () => {
        contactPage.classList.add('hidden');
        // TRUE pour remettre le blanc
        const couleurPage = couleursPages[currentPage] || '#FFFFFF';
        changerCouleurNavigateur(couleurPage, true);
    });
}


// --- 7. GESTION DU CLIC SUR LE LOGO ---
const logos = document.querySelectorAll('.logo, .logo-menu');

logos.forEach(logo => {
    logo.style.cursor = 'pointer';

    logo.addEventListener('click', () => {
        currentPage = 0;
        afficherProjets(); // afficherProjets s'occupe déjà de remettre le blanc en TRUE

        if (contactPage && !contactPage.classList.contains('hidden')) {
            contactPage.classList.add('hidden');
        }

        fermerMenu();
    });
});


// --- 8. GESTION DU LOADER (ÉCRAN D'ACCUEIL) ET NOTIFICATION ---
window.addEventListener('load', () => {
    const loader = document.getElementById('site-loader');
    const notif = document.getElementById('ios-notification');
    const contactPage = document.getElementById('contact-page');
    const notifContactBtn = document.getElementById('notif-contact-btn');

    // Disparition du loader après 2.5 secondes
    setTimeout(() => {
        if (loader) {
            loader.classList.add('hidden-loader');

            setTimeout(() => {
                loader.style.display = 'none';

                if (notif) {
                    setTimeout(() => {
                        notif.classList.add('show');
                    }, 500);

                    // Disparition automatique au bout de 12 secondes
                    setTimeout(() => {
                        if (notif && !notif.classList.contains('expanded')) {
                            notif.classList.remove('show');
                        }
                    }, 12000);
                }
            }, 800);
        }
    }, 2500);

    // --- GESTION DES GESTES TACTILES ET CLICS ---
    if (notif) {
        let startY = 0;
        let currentY = 0;
        let isSwiping = false;

        // 1. GESTION DU GLISSEMENT (SWIPE)
        notif.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isSwiping = true;
            notif.classList.add('dragging');
        }, { passive: true });

        notif.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentY = e.touches[0].clientY;
            let diffY = currentY - startY;

            // Si déjà étendu, on bloque le mouvement vers le bas pour le scroll natif
            if (notif.classList.contains('expanded') && diffY > 0) return;

            notif.style.transform = `translateX(-50%) translateY(${diffY}px)`;
        }, { passive: true });

        notif.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            notif.classList.remove('dragging');
            notif.style.transform = '';

            let diffY = currentY - startY;

            // GLISSER VERS LE BAS (> 70px) : Étend la notification
            if (diffY > 70 && !notif.classList.contains('expanded')) {
                notif.classList.add('expanded');
            }
            // GLISSER VERS LE HAUT (< -40px) : Fait disparaître la notification
            else if (diffY < -40) {
                notif.classList.remove('show', 'expanded');
            }
        });

        // 2. FERMER EN CLIQUANT/TOUCHANT EN DEHORS DE LA BULLE
        const fermerSiHorsNotif = (e) => {
            if (notif.classList.contains('show') && !notif.contains(e.target)) {
                notif.classList.remove('show', 'expanded');
            }
        };

        document.addEventListener('touchstart', fermerSiHorsNotif, { passive: true });
        document.addEventListener('click', fermerSiHorsNotif);
    }

    // --- CLIC SUR LE BOUTON CONTACT DE LA NOTIFICATION ---
    if (notifContactBtn && contactPage && notif) {
        notifContactBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notif.classList.remove('show', 'expanded');
            contactPage.classList.remove('hidden');
            // TRUE ici pour colorer toute la page contact en rouge et éviter le bord blanc
            changerCouleurNavigateur('#FF0027', true);
        });
    }
});


// --- 9. SYSTÈME DE TICKET À GRATTER (AVEC VRAIE TEXTURE PHOTO) ---
function initScratchCard(canvas, img, container, promptDiv) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;

    setTimeout(() => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        ctx.fillStyle = '#FF0027';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const glassTexture = new Image();
        glassTexture.src = '#FFFFFFF';

        glassTexture.onload = () => {
            const scale = Math.max(canvas.width / glassTexture.width, canvas.height / glassTexture.height);
            const x = (canvas.width / 2) - (glassTexture.width / 2) * scale;
            const y = (canvas.height / 2) - (glassTexture.height / 2) * scale;

            ctx.globalAlpha = 0.9;
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(glassTexture, x, y, glassTexture.width * scale, glassTexture.height * scale);
            ctx.globalAlpha = 1.0;
        };

        glassTexture.onerror = () => {
            console.warn("L'image texture-verre.jpg n'a pas été trouvée, le ticket reste gris argenté.");
        };

    }, 50);

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function scratch(e) {
        if (!isDrawing) return;
        e.preventDefault();

        if (promptDiv.style.opacity !== '0') {
            promptDiv.style.opacity = '0';
        }

        const pos = getMousePos(e);
        ctx.globalCompositeOperation = 'destination-out';

        const gradient = ctx.createRadialGradient(pos.x, pos.y, 10, pos.x, pos.y, 65);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 65, 0, 2 * Math.PI);
        ctx.fill();
    }

    canvas.addEventListener('mousedown', () => { isDrawing = true; });
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });

    canvas.addEventListener('touchstart', (e) => { isDrawing = true; }, { passive: false });
    canvas.addEventListener('touchend', () => { isDrawing = false; });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    canvas.addEventListener('touchcancel', () => { isDrawing = false; });
}

// --- 10. GESTION DU SYSTÈME ASSISTIVE TOUCH (iOS) ---
const assistiveBtn = document.getElementById('assistive-btn');
const assistiveMenu = document.getElementById('assistive-menu');
const assistiveOverlay = document.getElementById('assistive-overlay');
const audioPlayer = document.getElementById('projet-audio');

let isDragging = false;
let hasDragged = false;
let startX, startY;

function startDrag(e) {
    if (!assistiveBtn) return;
    isDragging = true;
    hasDragged = false;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    startX = clientX - assistiveBtn.getBoundingClientRect().left;
    startY = clientY - assistiveBtn.getBoundingClientRect().top;
}

function moveDrag(e) {
    if (!isDragging || !assistiveBtn) return;
    hasDragged = true;
    e.preventDefault();

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    // ⚠️ LA SYNTAXE EST RÉPARÉE ICI
    assistiveBtn.style.left = `${clientX - startX}px`;
    assistiveBtn.style.top = `${clientY - startY}px`;
    assistiveBtn.style.bottom = 'auto';
    assistiveBtn.style.right = 'auto';
}

function endDrag() {
    isDragging = false;
}

if (assistiveBtn) {
    assistiveBtn.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);

    assistiveBtn.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    assistiveBtn.addEventListener('click', () => {
        if (!hasDragged) {
            assistiveMenu.classList.add('active');
            assistiveOverlay.classList.add('active');
        }
    });
}

if (assistiveOverlay) {
    assistiveOverlay.addEventListener('click', () => {
        assistiveMenu.classList.remove('active');
        assistiveOverlay.classList.remove('active');
        // TRUE pour nettoyer toute couleur résiduelle après la fermeture du menu Apple
        changerCouleurNavigateur(couleursPages[currentPage] || '#FFFFFF', true);
    });
}

// 3. Actions des boutons du menu
const btnExplication = document.getElementById('ast-explication');
if (btnExplication) {
    btnExplication.addEventListener('click', () => {
        assistiveMenu.classList.remove('active');
        assistiveOverlay.classList.remove('active');

        const projetInfo = projets[(currentPage * itemsPerPage) + 1];
        if (projetInfo) ouvrirPopup(projetInfo, true);
    });
}

const btnMusic = document.getElementById('ast-music');
if (btnMusic && audioPlayer) {
    btnMusic.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            document.querySelector('#ast-music span:not(.icon)').innerText = "Pause";
        } else {
            audioPlayer.pause();
            document.querySelector('#ast-music span:not(.icon)').innerText = "Musique";
        }
    });
}

const btnShare = document.getElementById('ast-share');
if (btnShare) {
    btnShare.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            const textSpan = document.querySelector('#ast-share span:not(.icon)');
            textSpan.innerText = "Copié !";
            setTimeout(() => textSpan.innerText = "Partager", 2000);
        });
    });
}

const btnMagic = document.getElementById('ast-magic');
if (btnMagic) {
    btnMagic.addEventListener('click', () => {
        assistiveMenu.classList.remove('active');
        assistiveOverlay.classList.remove('active');
        // TRUE pour remettre le blanc parfait sur tout l'écran après le clic sur la magie
        changerCouleurNavigateur(couleursPages[currentPage] || '#FFFFFF', true);

        if (typeof confetti !== "undefined") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF0027', '#000000', '#FFFFFF']
            });
        }
    });

    const btnInsta = document.getElementById('ast-insta');
    if (btnInsta) {
        btnInsta.addEventListener('click', () => {
            assistiveMenu.classList.remove('active');
            assistiveOverlay.classList.remove('active');
            window.open('https://www.instagram.com/designbyneed/', '_blank');
        });
    }

    const btnLinkedin = document.getElementById('ast-linkedin');
    if (btnLinkedin) {
        btnLinkedin.addEventListener('click', () => {
            assistiveMenu.classList.remove('active');
            assistiveOverlay.classList.remove('active');
            window.open('https://www.linkedin.com/in/deen-haldane-5494bb195?utm_source=share_via&utm_content=profile&utm_medium=member_ios', '_blank');
        });
    }
}

// =========================================
// 11. GESTION DU CURSEUR PERSONNALISÉ
// =========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;

    // 1. Mise à jour des coordonnées et détection des couleurs de fond
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;

        // DÉTECTION INTELLIGENTE DU FOND
        if (e.target.closest('.contact-form-container') || e.target.closest('.menu-item:first-child') || e.target.closest('.ios-notif-action-btn')) {
            cursorDot.classList.add('on-black');
            cursorOutline.classList.add('on-black');
            cursorDot.classList.remove('on-red');
            cursorOutline.classList.remove('on-red');
        }
        else if (e.target.closest('.contact-info') || e.target.closest('.white-card')) {
            cursorDot.classList.remove('on-red', 'on-black');
            cursorOutline.classList.remove('on-red', 'on-black');
        }
        else if (e.target.closest('#fullscreen-menu') || e.target.closest('#contact-page')) {
            cursorDot.classList.add('on-red');
            cursorOutline.classList.add('on-red');
            cursorDot.classList.remove('on-black');
            cursorOutline.classList.remove('on-black');
        }
        else {
            cursorDot.classList.remove('on-red', 'on-black');
            cursorOutline.classList.remove('on-red', 'on-black');
        }
    });

    // 2. Boucle d'animation (effet retard du cercle)
    function animateCursor() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;

        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // 3. Détection du survol (Hover)
    const cliquables = 'a, button, .bento-item, .logo, .logo-menu, .page-num, .assistive-btn, .close-btn, .close-lightbox-btn, .menu-item, input, textarea, label';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(cliquables)) {
            cursorDot.classList.add('hovered');
            cursorOutline.classList.add('hovered');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(cliquables)) {
            cursorDot.classList.remove('hovered');
            cursorOutline.classList.remove('hovered');
        }
    });
}