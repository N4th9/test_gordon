// =================================================================
// 1. IMPORTS MODULES FIREBASE (v10)
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =================================================================
// 2. CONFIGURATION FIREBASE & EMAILJS
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyB40W_MNntjthCBSuuXb_oFyVF71YvTAl4",
  authDomain: "auto-test-gordon.firebaseapp.com",
  projectId: "auto-test-gordon",
  storageBucket: "auto-test-gordon.firebasestorage.app",
  messagingSenderId: "497562101003",
  appId: "1:497562101003:web:26df89c029510e22166e0e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const EMAILJS_SERVICE_ID = "service_cu20tin";
const EMAILJS_TEMPLATE_ID = "template_utxgj5p";

// VARIABLES GLOBALES
let meDerniersScores = null;
let chartInstance = null;

// =================================================================
// 3. FONCTION DE SAUVEGARDE FIRESTORE
// =================================================================
async function sauvegarderDansFirebase(userData, scores) {
  try {
    console.log("Sauvegarde dans Firebase...", userData, scores);
    
    const docRef = await addDoc(collection(db, "resultats"), {
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      scores: {
        passivite: scores.passivite,
        agressivite: scores.agressivite,
        manipulation: scores.manipulation,
        assertivite: scores.assertivite
      },
      dateEnregistrement: serverTimestamp()
    });

    console.log(" Enregistrement réussi dans Firebase ! ID :", docRef.id);
    return true;
  } catch (erreur) {
    console.error(" Erreur Firebase :", erreur);
    return false;
  }
}

// =================================================================
// 4. SOUMISSION FORMULAIRE DE CONNEXION
// =================================================================
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const user = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        email: document.getElementById('email').value.trim()
    };
    sessionStorage.setItem('user', JSON.stringify(user));

    afficherUserInfo();

    document.getElementById('step-login').classList.add('hidden');
    document.getElementById('step-quiz').classList.remove('hidden');

    history.pushState({ step: 'quiz' }, "", location.href);
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

// EMPÊCHER NAVIGATION RETOUR
window.onpopstate = function(event) {
    history.pushState(null, "", location.href);
};

// =================================================================
// 5. LISTE DES 60 QUESTIONS & GRILLE D'ATTITUDES
// =================================================================
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

const grilleAttitudes = {
    passivite: [1, 7, 15, 16, 17, 25, 26, 35, 36, 37, 50, 51, 52, 59, 60],
    agressivite: [4, 6, 10, 11, 20, 21, 28, 29, 30, 39, 40, 48, 49, 55, 56],
    manipulation: [3, 5, 9, 12, 13, 19, 22, 31, 32, 41, 42, 46, 47, 54, 57],
    assertivite: [2, 8, 14, 18, 23, 24, 27, 33, 34, 38, 43, 44, 45, 53, 58]
};

document.addEventListener('DOMContentLoaded', () => {
    afficherUserInfo();
    genererFormulaire();
});

function genererFormulaire() {
    const container = document.getElementById('questionsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    questions.forEach((qText, index) => {
        const qNum = index + 1;
        const div = document.createElement('div');
        div.className = 'question-card';
        div.innerHTML = `
            <div class="question-text"><strong>${qNum}.</strong> ${qText}</div>
            <div class="question-options">
                <label class="option-label">
                    <input type="radio" name="q_${qNum}" value="vrai"> Plutôt vrai
                </label>
                <label class="option-label">
                    <input type="radio" name="q_${qNum}" value="faux"> Plutôt faux
                </label>
            </div>
        `;
        container.appendChild(div);
    });
}

// =================================================================
// 6. VALIDATION DU QUESTIONNAIRE & SAUVEGARDE UNIFIÉE
// =================================================================
document.getElementById('quizForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const reponsesVrai = [];

    for (let i = 1; i <= 60; i++) {
        if (formData.get(`q_${i}`) === 'vrai') {
            reponsesVrai.push(i);
        }
    }

    // Calcul EXACT des scores
    const scores = {
        passivite: calculerScoreAttitude(grilleAttitudes.passivite, reponsesVrai),
        agressivite: calculerScoreAttitude(grilleAttitudes.agressivite, reponsesVrai),
        manipulation: calculerScoreAttitude(grilleAttitudes.manipulation, reponsesVrai),
        assertivite: calculerScoreAttitude(grilleAttitudes.assertivite, reponsesVrai)
    };

    // Récupération de l'utilisateur stocké
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { nom: "", prenom: "", email: "" };

    // Enregistrement dans Firestore avec les vrais scores calculés
    await sauvegarderDansFirebase(user, scores);

    // Affichage à l'écran et génération du graphique
    afficherRésultats(scores);
});

function calculerScoreAttitude(listeQuestions, reponsesVrai) {
    return listeQuestions.filter(qNum => reponsesVrai.includes(qNum)).length;
}

// =================================================================
// 7. AFFICHAGE DES RÉSULTATS (GRAPHIC & SYNTHÈSE)
// =================================================================
function afficherRésultats(scores) {
    meDerniersScores = scores;

    const stepQuiz = document.getElementById('step-quiz');
    const stepResults = document.getElementById('step-results');

    if (stepQuiz) stepQuiz.classList.add('hidden');
    if (stepResults) stepResults.classList.remove('hidden');

    const summaryEl = document.getElementById('scoresSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div class="score-line passivite" style="margin-bottom: 8px; padding: 10px; background: #fdf2f2; border-left: 4px solid #e74c3c;">
                🔴 <strong>Attitude Passive (Fuite) :</strong> ${scores.passivite} / 15 points
            </div>
            <div class="score-line agressivite" style="margin-bottom: 8px; padding: 10px; background: #fef5ed; border-left: 4px solid #e67e22;">
                🟠 <strong>Attitude Agressive (Attaque) :</strong> ${scores.agressivite} / 15 points
            </div>
            <div class="score-line manipulation" style="margin-bottom: 8px; padding: 10px; background: #fcfbe6; border-left: 4px solid #f1c40f;">
                🟡 <strong>Attitude Manipulatrice (Calcul) :</strong> ${scores.manipulation} / 15 points
            </div>
            <div class="score-line assertivite" style="margin-bottom: 8px; padding: 10px; background: #edfbf3; border-left: 4px solid #2ecc71;">
                🟢 <strong>Attitude Assertive (Affirmation de soi) :</strong> ${scores.assertivite} / 15 points
            </div>
        `;
    }

    const btnSend = document.getElementById('btnSendEmail');
    const statusEl = document.getElementById('emailStatus');
    if (btnSend) {
        btnSend.disabled = false;
        btnSend.textContent = "📧 Recevoir par e-mail";
    }
    if (statusEl) statusEl.textContent = "";

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
                        title: { display: true, text: 'Points (Nombre de "Plutôt vrai")' }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    stepResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =================================================================
// 8. ENVOI DE L'EMAIL VIA EMAILJS
// =================================================================
document.getElementById('btnSendEmail')?.addEventListener('click', async function() {
    if (typeof emailjs === 'undefined') {
        alert("Le service d'e-mail n'a pas pu s'initialiser.");
        return;
    }

    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.email) {
        alert("Adresse e-mail introuvable.");
        return;
    }

    if (!meDerniersScores) {
        alert("Aucun score n'a été trouvé à envoyer.");
        return;
    }

    const btn = this;
    const statusEl = document.getElementById('emailStatus');

    btn.disabled = true;
    btn.textContent = "Génération de la capture...";

    if (statusEl) {
        statusEl.style.color = "black";
        statusEl.textContent = "Génération du rendu visuel...";
    }

    try {
        let chartImageBase64 = "";
        const canvas = document.getElementById('histogramCanvas');
        if (canvas) {
            chartImageBase64 = canvas.toDataURL('image/png');
        }

        btn.textContent = "Envoi en cours...";

        const templateParams = {
            user_name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
            user_email: user.email,
            to_email: user.email,
            score_passivite: meDerniersScores.passivite,
            score_agressivite: meDerniersScores.agressivite,
            score_manipulation: meDerniersScores.manipulation,
            score_assertivite: meDerniersScores.assertivite,
            chart_image: chartImageBase64
        };

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

        btn.textContent = "✓ Email envoyé !";
        if (statusEl) {
            statusEl.style.color = "green";
            statusEl.className = "email-status success";
            statusEl.textContent = `Message envoyé avec succès à ${user.email} !`;
        }

    } catch (error) {
        console.error("Erreur EmailJS :", error);
        btn.disabled = false;
        btn.textContent = "✉️ Réessayer";
        if (statusEl) {
            statusEl.style.color = "red";
            statusEl.className = "email-status error";
            statusEl.textContent = "Échec de l'envoi : " + JSON.stringify(error);
        }
    }
});