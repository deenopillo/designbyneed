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
    // 1. Trouve ou crée la balise meta theme-color
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', couleur);

    // 2. Nettoie les balises en double qui créent des conflits sur Safari
    const toutesLesMetas = document.querySelectorAll('meta[name="theme-color"]');
    if (toutesLesMetas.length > 1) {
        toutesLesMetas.forEach((meta, index) => {
            if (index > 0) meta.remove(); // On ne garde que la première
        });
    }

    // 3. ANTI-CACHE : Force la couleur de fond DIRECTEMENT UNIQUEMENT si on le demande
    if (changerLeFond) {
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

    // Application de la couleur au body et au navigateur
    document.body.style.backgroundColor = couleurActuelle;
    changerCouleurNavigateur(couleurActuelle);

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

    // Le conteneur s'appelle toujours 'pagination' dans le JS
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

    // Si on dépasse la dernière page, on retourne à la première
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

    // Ajoute le "false" ici 👇
    changerCouleurNavigateur('#000000', false);
}

function fermerPopup() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = ''; // Rétablit le scroll

    // NOUVEAU : On remet la couleur blanche (ou celle de la page) aux barres du téléphone
    const couleurPage = couleursPages[currentPage] || '#FFFFFF';
    changerCouleurNavigateur(couleurPage);
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
let menuTimeout; // Permet de stocker le délai pour pouvoir l'annuler si besoin

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

    // On annule tout compte à rebours précédent par sécurité
    clearTimeout(menuTimeout);

    // On attend 800ms (la durée exacte du rebond CSS) avant d'afficher le rouge
    menuTimeout = setTimeout(() => {
        changerCouleurNavigateur('#FF0027', false);
    }, 2000);
}

function fermerMenu() {
    fullscreenMenu.classList.remove('menu-ouvert');

    // Si on ferme le menu avant la fin des 800ms, on annule le passage au rouge
    clearTimeout(menuTimeout);

    // Remet la couleur exacte de la page courante immédiatement
    const couleurPage = couleursPages[currentPage] || '#FFFFFF';
    changerCouleurNavigateur(couleurPage);
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
        // Ajoute le "false" ici 👇
        changerCouleurNavigateur('#FF0027', false);
    });

    backToHomeBtn.addEventListener('click', () => {
        contactPage.classList.add('hidden');
        // Remet la couleur exacte de la page courante lors de la fermeture
        const couleurPage = couleursPages[currentPage] || '#FFFFFF';
        changerCouleurNavigateur(couleurPage);
    });
}


// --- 7. GESTION DU CLIC SUR LE LOGO ---
const logos = document.querySelectorAll('.logo, .logo-menu');

logos.forEach(logo => {
    logo.style.cursor = 'pointer';

    logo.addEventListener('click', () => {
        currentPage = 0;
        afficherProjets();

        if (contactPage && !contactPage.classList.contains('hidden')) {
            contactPage.classList.add('hidden');
        }

        fermerMenu();
    });
});


// --- 8. GESTION DU LOADER (ÉCRAN D'ACCUEIL) ---
window.addEventListener('load', () => {
    const loader = document.getElementById('site-loader');

    // Disparition après 2.5 secondes
    setTimeout(() => {
        if (loader) {
            loader.classList.add('hidden-loader');

            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }
    }, 2500);
});


// --- 9. SYSTÈME DE TICKET À GRATTER (AVEC VRAIE TEXTURE PHOTO) ---
function initScratchCard(canvas, img, container, promptDiv) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;

    // ASTUCE : On attend 50ms pour laisser le temps au navigateur de dessiner 
    // la grille et de donner une vraie largeur/hauteur au container
    setTimeout(() => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // 1. FALLBACK DE SÉCURITÉ : On met un fond gris argenté.
        // Comme ça, même si l'image "texture-verre.jpg" n'existe pas, on a quand même un ticket à gratter !
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. On charge TA vraie photo de texture
        const glassTexture = new Image();
        glassTexture.src = 'images/texture-verre.jpg';

        glassTexture.onload = () => {
            // L'image est trouvée, on la dessine par-dessus le gris
            const scale = Math.max(canvas.width / glassTexture.width, canvas.height / glassTexture.height);
            const x = (canvas.width / 2) - (glassTexture.width / 2) * scale;
            const y = (canvas.height / 2) - (glassTexture.height / 2) * scale;

            ctx.globalAlpha = 0.9;
            ctx.globalCompositeOperation = 'source-over'; // S'assure qu'on dessine par dessus
            ctx.drawImage(glassTexture, x, y, glassTexture.width * scale, glassTexture.height * scale);
            ctx.globalAlpha = 1.0;
        };

        glassTexture.onerror = () => {
            console.warn("L'image texture-verre.jpg n'a pas été trouvée, le ticket reste gris argenté.");
        };

    }, 50); // Le fameux délai de 50 millisecondes

    // --- LE PINCEAU POUR GRATTER ---
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function scratch(e) {
        if (!isDrawing) return;
        e.preventDefault();

        // Fait disparaître le texte "grattez-moi"
        if (promptDiv.style.opacity !== '0') {
            promptDiv.style.opacity = '0';
        }

        const pos = getMousePos(e);
        ctx.globalCompositeOperation = 'destination-out'; // C'est ça qui "efface"

        const gradient = ctx.createRadialGradient(pos.x, pos.y, 10, pos.x, pos.y, 65);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 65, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Événements souris
    canvas.addEventListener('mousedown', () => { isDrawing = true; });
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });

    // Événements tactiles (téléphone)
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

// 1. Logique de Déplacement (Drag & Drop)
let isDragging = false;
let hasDragged = false; // Pour différencier un clic d'un glissement
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
    hasDragged = true; // S'il bouge, ce n'est plus un simple clic
    e.preventDefault(); // Empêche le scroll sur mobile

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    assistiveBtn.style.left = `${clientX - startX}px`;
    assistiveBtn.style.top = `${clientY - startY}px`;
    assistiveBtn.style.bottom = 'auto'; // Désactive le CSS par défaut
    assistiveBtn.style.right = 'auto';
}

function endDrag() {
    isDragging = false;
}

if (assistiveBtn) {
    // Événements Souris
    assistiveBtn.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);

    // Événements Tactiles (Mobile)
    assistiveBtn.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', moveDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // 2. Ouverture / Fermeture du Menu
    assistiveBtn.addEventListener('click', () => {
        if (!hasDragged) { // Ouvre uniquement si on a juste cliqué, pas glissé
            assistiveMenu.classList.add('active');
            assistiveOverlay.classList.add('active');
        }
    });
}

if (assistiveOverlay) {
    assistiveOverlay.addEventListener('click', () => {
        assistiveMenu.classList.remove('active');
        assistiveOverlay.classList.remove('active');
    });
}

// 3. Actions des boutons du menu
const btnExplication = document.getElementById('ast-explication');
if (btnExplication) {
    btnExplication.addEventListener('click', () => {
        assistiveMenu.classList.remove('active');
        assistiveOverlay.classList.remove('active');

        // On récupère le bon projet (ici index 1 pour "Need Studio" comme ton ancien bouton)
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
        if (typeof confetti !== "undefined") {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF0027', '#000000', '#FFFFFF']
            });
        }
    });

    // Action pour ouvrir Instagram
    const btnInsta = document.getElementById('ast-insta');
    if (btnInsta) {
        btnInsta.addEventListener('click', () => {
            assistiveMenu.classList.remove('active');
            assistiveOverlay.classList.remove('active');
            window.open('https://www.instagram.com/designbyneed/', '_blank');
        });
    }

    // Action pour ouvrir LinkedIn
    const btnLinkedin = document.getElementById('ast-linkedin');
    if (btnLinkedin) {
        btnLinkedin.addEventListener('click', () => {
            assistiveMenu.classList.remove('active');
            assistiveOverlay.classList.remove('active');
            window.open('https://www.linkedin.com/in/deen-haldane-5494bb195?utm_source=share_via&utm_content=profile&utm_medium=member_ios', '_blank');
        });
    }

}