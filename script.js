// 1. Soumission du formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Enregistrer l'utilisateur dans la session
    const user = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        email: document.getElementById('email').value.trim()
    };
    sessionStorage.setItem('user', JSON.stringify(user));

    // Afficher les infos utilisateur dans l'en-tête
    afficherUserInfo();

    // Passer de l'écran de connexion au questionnaire
    document.getElementById('step-login').classList.add('hidden');
    document.getElementById('step-quiz').classList.remove('hidden');

    // Sécurité : empécher le retour en arrière vers la connexion
    history.pushState({ step: 'quiz' }, "", location.href);
});

// Empêcher la navigation de retour arrière
window.onpopstate = function(event) {
    history.pushState(null, "", location.href);
};

// DECLARATION CRUCIALE : doit être au niveau global !
let scoresCalcules = null; 
let chartInstance = null;

// Initialisation EmailJS
(function() {
    if (window.emailjs) {
        emailjs.init("2ch1BICsb9DH4rt5C");
    }
})();

// Liste intégrale des 60 questions
const questions = [
    "J’ai souvent du mal à refuser et à dire non",
    "Je suis sur(e) de mes droits, je les défends sans empiéter sur ceux des autres",
    "Je suis prudent(e), je ne me livre pas si je ne connais pas bien mon vis à vis",
    "Je décide et je tranche facilement",
    "Quand c’est possible, j’agis par personne interposée plutôt que directement, c’est plus efficace",
    "Je suis direct(e) ! je dis aux gens ce que je pense et je ne crains pas de les critiquer",
    "Je n’ose pas dire mon opinion devant un groupe ou dans une réunion",
    "Je donne mon avis sans états d’âme, même si cela va à l’encontre de l’opinion générale",
    "Dans les débats, j’observe et j’attends de voir comment ça tourne pour définir ma stratégie",
    "On me reproche parfois d’avoir l’esprit de contradiction",
    "J’ai du mal à écouter les autres",
    "je m’arrange pour être au courant de tout (même des petits potins), cela me rend bien service",
    "J’ai la réputation d’être assez habile avec les gens",
    "Je fais confiance aux gens qui m’entourent",
    "Je n’ose pas demander d’aide, j’ai peur que l’on me juge incapable ou incompétent",
    "J’ai du mal à me décider quand je dois faire quelque chose d’inhabituel",
    "Je suis un(e) faux (sse) calme : quand je m’énerve je fais parfois rire les autres",
    "Je suis à l’aise devant les gens, en groupe comme en face à face",
    "Je joue souvent la comédie pour arriver à mes fins",
    "Je coupe souvent la parole aux autres sans m'en rendre compte à temps",
    "J'aime avoir le dernier mot et imposer mon point de vue.",
    "Je sais qui il faut voir et quand il faut le/la. ..voir, cela m'a beaucoup servi.",
    "Je règle les désaccords en trouvant un compromis qui convienne à chacun.",
    "Je préfère agir franchement sans cacher mes intentions.",
    "Je remets souvent à plus tard ce que je dois faire",
    "Je dis souvent: “ Ça m'est égal! Comme tu veux! \"",
    "Je me présente comme je suis, sans complexe.",
    "Il en faut beaucoup pour m'intimider.",
    "Je fais peur aux autres pour m'imposer.",
    "Je me fais rarement avoir mais, si cela arrive, je sais prendre ma revanche.",
    "J'exagère les faits, je caricature les situations pour obtenir ce que je veux.",
    "Je suis débrouillard(e), je sais tirer -parti du système.",
    "Je suis à la fois bien avec moi-même, bien avec les autres. ..",
    "Je sais exprimer mon désaccord sans excès, de façon à me faire entendre",
    "J'ai le souci de ne pas importuner les autres.",
    "J'ai du mal à prendre parti et à choisir.",
    "Je n'aime pas être seul(e) à exprimer un avis dans un groupe.",
    "Je n'ai pas peur de parler en public.",
    "La vie m'a appris à savoir me défendre et lutter.",
    "J'aime les défis, les risques, même excessifs.",
    "Je suis souvent assez habile pour éviter les conflits",
    "Je “ joue cartes sur table\" pour mettre les gens en confiance.",
    "J'ai de bonnes capacités d'écoute et d'attention.",
    "Quand j'ai décidé une chose, je la mène jusqu'au bout malgré les imprévus.",
    "J'exprime sans réticence ce que je ressens.",
    "J'arrive à amener les gens à adhérer à mes idées, je suis persuasif (ve).",
    "Compliments, sourires, flatteries permettent d'obtenir ce que l'on veut.",
    "J'ai du mal à maîtriser mon temps de parole.",
    "Je sais manier l'ironie mordante.",
    "Je suis serviable et facile à vivre, je me fais même parfois exploiter.",
    "J'aime mieux observer que participer.",
    "Je n'aime pas être au premier rang, je préfère les seconds rôles.",
    "J'ai pris l'habitude de ne pas me comparer aux autres.",
    "Je trouve maladroit de dévoiler trop vite mes intentions.",
    "Je choque parfois les gens par mes propos.",
    "Si je n'avais pas appris à me défendre, j'aurais été dévoré(e).",
    "On obtient plus facilement ce que l'on veut en cachant ses objectifs plutôt qu'en révélant ses intentions.",
    "Je sais détendre mon entourage par un humour sans arrière-pensée.",
    "On ne peut prétender régler un problème sans en chercher les causes profondes.",
    "Je n'aime pas me faire mal voir."
];

// Grille de correspondance
const grilleAttitudes = {
    passivite: [1, 7, 15, 16, 17, 25, 26, 35, 36, 37, 50, 51, 52, 59, 60],
    agressivite: [4, 6, 10, 11, 20, 21, 28, 29, 30, 39, 40, 48, 49, 55, 56],
    manipulation: [3, 5, 9, 12, 13, 19, 22, 31, 32, 41, 42, 46, 47, 54, 57],
    assertivite: [2, 8, 14, 18, 23, 24, 27, 33, 34, 38, 43, 44, 45, 53, 58]
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    afficherUserInfo();
    genererFormulaire();
});

function afficherUserInfo() {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl) {
            userInfoEl.textContent = `Participant : ${user.prenom} ${user.nom}`;
        }
    }
}

function genererFormulaire() {
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    container.innerHTML = ''; // Réinitialiser au cas où
    questions.forEach((qText, index) => {
        const qNum = index + 1;
        const div = document.createElement('div');
        div.className = 'question-card';
        div.innerHTML = `
            <div class="question-text"><strong>${qNum}.</strong> ${qText}</div>
            <div class="question-options">
                <label class="option-label">
                    <input type="radio" name="q_${qNum}" value="vrai" required> Plutôt vrai
                </label>
                <label class="option-label">
                    <input type="radio" name="q_${qNum}" value="faux" required> Plutôt faux
                </label>
            </div>
        `;
        container.appendChild(div);
    });
}

// 2. Traitement de la validation du questionnaire
document.getElementById('quizForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const reponsesVrai = [];

    for (let i = 1; i <= 60; i++) {
        if (formData.get(`q_${i}`) === 'vrai') {
            reponsesVrai.push(i);
        }
    }

    const scores = {
        passivite: calculerScoreAttitude(grilleAttitudes.passivite, reponsesVrai),
        agressivite: calculerScoreAttitude(grilleAttitudes.agressivite, reponsesVrai),
        manipulation: calculerScoreAttitude(grilleAttitudes.manipulation, reponsesVrai),
        assertivite: calculerScoreAttitude(grilleAttitudes.assertivite, reponsesVrai)
    };

    afficherRésultats(scores);
});

function calculerScoreAttitude(listeQuestions, reponsesVrai) {
    return listeQuestions.filter(qNum => reponsesVrai.includes(qNum)).length;
}

// 3. Affichage de l'histogramme et masquage du formulaire
function afficherRésultats(scores) {
    // Masquer le formulaire de test et afficher l'écran des résultats
    const stepQuiz = document.getElementById('step-quiz');
    const stepResults = document.getElementById('step-results');

    if (stepQuiz) stepQuiz.classList.add('hidden');
    if (stepResults) stepResults.classList.remove('hidden');

    // Affichage des scores individuels
    const summaryEl = document.getElementById('scoresSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="score-box passivite">Passivité : <strong>${scores.passivite} / 15</strong></div>
            <div class="score-box agressivite">Agressivité : <strong>${scores.agressivite} / 15</strong></div>
            <div class="score-box manipulation">Manipulation : <strong>${scores.manipulation} / 15</strong></div>
            <div class="score-box assertivite">Assertivité : <strong>${scores.assertivite} / 15</strong></div>
        `;
    }

    // Construction de l'histogramme avec Chart.js
    const canvas = document.getElementById('histogramCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy(); // Réinitialiser si un graphique existe déjà
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Passivité', 'Agressivité', 'Manipulation', 'Assertivité'],
            datasets: [{
                label: 'Score obtenu',
                data: [scores.passivite, scores.agressivite, scores.manipulation, scores.assertivite],
                backgroundColor: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71'],
                borderColor: ['#c0392b', '#d35400', '#f39c12', '#27ae60'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 15,
                    ticks: { stepSize: 1 },
                    title: { display: true, text: 'Points (Nombre de "Plutôt vrai")' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Fait défiler la page en douceur vers le haut de la zone de résultats
    stepResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const EMAILJS_SERVICE_ID = "service_cu20tin";
const EMAILJS_TEMPLATE_ID = "template_2rxgsju";

// Stockage temporaire des scores pour le bouton d'envoi
let meDerniersScores = null;


// =================================================================
// 2. FONCTION D'AFFICHAGE DES RÉSULTATS
// =================================================================
function afficherRésultats(scores) {
    // Sauvegarder les scores globalement pour l'envoi différé
    meDerniersScores = scores;

    const stepQuiz = document.getElementById('step-quiz');
    const stepResults = document.getElementById('step-results');

    if (stepQuiz) stepQuiz.classList.add('hidden');
    if (stepResults) stepResults.classList.remove('hidden');

    // Affichage des scores
    const summaryEl = document.getElementById('scoresSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="score-box passivite">Passivité : <strong>${scores.passivite} / 15</strong></div>
            <div class="score-box agressivite">Agressivité : <strong>${scores.agressivite} / 15</strong></div>
            <div class="score-box manipulation">Manipulation : <strong>${scores.manipulation} / 15</strong></div>
            <div class="score-box assertivite">Assertivité : <strong>${scores.assertivite} / 15</strong></div>
        `;
    }

    // Réinitialiser le bouton et le statut d'email
    const btnSend = document.getElementById('btnSendEmail');
    const statusEl = document.getElementById('emailStatus');
    if (btnSend) {
        btnSend.disabled = false;
        btnSend.textContent = "📧 Recevoir par e-mail";
    }
    if (statusEl) statusEl.textContent = "";

    // Affichage de l'histogramme Chart.js
    const canvas = document.getElementById('histogramCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Passivité', 'Agressivité', 'Manipulation', 'Assertivité'],
                datasets: [{
                    label: 'Score obtenu',
                    data: [scores.passivite, scores.agressivite, scores.manipulation, scores.assertivite],
                    backgroundColor: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71'],
                    borderColor: ['#c0392b', '#d35400', '#f39c12', '#27ae60'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 15,
                        ticks: { stepSize: 1 },
                        title: { display: true, text: 'Points' }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    stepResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


// =================================================================
// 3. ÉCOUTEUR BOUTON D'ENVOI PAR EMAIL
// =================================================================
document.getElementById('btnSendEmail').addEventListener('click', function() {
    // 1. Vérification SDK EmailJS
    if (typeof emailjs === 'undefined') {
        alert("Le service d'e-mail n'a pas pu s'initialiser. Vérifiez votre connexion ou votre bloqueur de publicité.");
        return;
    }

    // 2. Vérification des données utilisateur
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.email) {
        alert("Adresse e-mail introuvable.");
        return;
    }

    // 3. Vérification des scores
    if (!meDerniersScores) {
        alert("Aucun score n'a été trouvé à envoyer.");
        return;
    }

    const btn = this;
    const statusEl = document.getElementById('emailStatus');

    btn.disabled = true;
    btn.textContent = "Envoi en cours...";

    // 4. Préparation des variables à envoyer au template EmailJS
    const templateParams = {
        user_name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
        user_email: user.email,
        score_passivite: meDerniersScores.passivite,
        score_agressivite: meDerniersScores.agressivite,
        score_manipulation: meDerniersScores.manipulation,
        score_assertivite: meDerniersScores.assertivite
    };

    // 5. Utilisation de emailjs.send (et non sendForm)
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(() => {
            btn.textContent = "✓ Email envoyé !";
            if (statusEl) {
                statusEl.className = "email-status success";
                statusEl.textContent = `Vos résultats ont été envoyés à ${user.email}`;
            }
        })
        .catch((error) => {
            console.error("Erreur EmailJS détaillée :", error);
            btn.disabled = false;
            btn.textContent = "✉️ Réessayer";
            if (statusEl) {
                statusEl.className = "email-status error";
                statusEl.textContent = "Échec de l'envoi. Vérifiez la console (F12) pour plus de détails.";
            }
        });
});