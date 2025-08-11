/* =================================
   GÉNÉRATEUR DE MOTS DE PASSE
   JavaScript pour toutes les fonctionnalités
   ================================= */

// =================================
// 1. VARIABLES GLOBALES
// =================================
// Tableau pour stocker tous les mots de passe sauvegardés
let savedPasswords = [];

// =================================
// 2. ÉLÉMENTS DOM
// =================================
// Récupération de tous les éléments HTML nécessaires
const lengthSlider = document.getElementById('lengthSlider');
const lengthDisplay = document.getElementById('lengthDisplay');
const generateBtn = document.getElementById('generateBtn');
const websiteInput = document.getElementById('website');
const strengthIndicator = document.getElementById('strengthIndicator');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const passwordsList = document.getElementById('passwordsList');
const totalCount = document.getElementById('totalCount');
const strongCount = document.getElementById('strongCount');
const avgLength = document.getElementById('avgLength');

// =================================
// 3. CONFIGURATION DES CARACTÈRES
// =================================
// Définition des jeux de caractères pour la génération
const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // 26 lettres majuscules
    lowercase: 'abcdefghijklmnopqrstuvwxyz', // 26 lettres minuscules
    numbers: '0123456789', // 10 chiffres
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?' // Symboles spéciaux
};

// =================================
// 4. GESTION DU SLIDER DE LONGUEUR
// =================================
/**
 * Met à jour l'affichage de la longueur quand le slider bouge
 */
lengthSlider.addEventListener('input', function() {
    lengthDisplay.textContent = this.value;
});

// =================================
// 5. GÉNÉRATION DU MOT DE PASSE
// =================================
/**
 * Génère un mot de passe aléatoire selon les options sélectionnées
 * @returns {string|null} Le mot de passe généré ou null si erreur
 */
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let charset = '';

    if (document.getElementById('uppercase').checked) charset += chars.uppercase;
    if (document.getElementById('lowercase').checked) charset += chars.lowercase;
    if (document.getElementById('numbers').checked) charset += chars.numbers;
    if (document.getElementById('symbols').checked) charset += chars.symbols;

    if (charset === '') {
        alert('Veuillez sélectionner au moins une option !');
        return null;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }

    return password;
}

// =================================
// 6. CALCUL DE LA FORCE DU MOT DE PASSE
// =================================
/**
 * Calcule la force d'un mot de passe sur une échelle de 0 à 100
 * @param {string} password - Le mot de passe à analyser
 * @returns {Object} Objet contenant score, niveau, couleur, classe CSS
 */
function calculateStrength(password) {
    let score = 0;

    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else score += 5;

    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 10;

    let level, color, text;
    if (score >= 85) {
        level = 'Très fort';
        color = 'bg-green-500';
        text = 'text-green-600';
    } else if (score >= 70) {
        level = 'Fort';
        color = 'bg-blue-500';
        text = 'text-blue-600';
    } else if (score >= 50) {
        level = 'Moyen';
        color = 'bg-yellow-500';
        text = 'text-yellow-600';
    } else {
        level = 'Faible';
        color = 'bg-red-500';
        text = 'text-red-600';
    }

    return { score, level, color, text };
}

// =================================
// 7. AFFICHAGE DE LA FORCE
// =================================
/**
 * Affiche visuellement la force du mot de passe
 * @param {string} password - Le mot de passe à analyser
 */
function showStrength(password) {
    const strength = calculateStrength(password);
    strengthIndicator.classList.remove('hidden');
    strengthFill.className = `h-full transition-all duration-300 ${strength.color}`;
    strengthFill.style.width = `${strength.score}%`;
    strengthText.className = `text-sm ${strength.text}`;
    strengthText.textContent = `Force: ${strength.level} (${strength.score}/100)`;
}

// =================================
// 8. SAUVEGARDE DES MOTS DE PASSE
// =================================
/**
 * Sauvegarde un mot de passe avec ses métadonnées
 * @param {string} website - Le site web associé
 * @param {string} password - Le mot de passe à sauvegarder
 */
function savePassword(website, password) {
    const strength = calculateStrength(password);
    const passwordObj = {
        id: Date.now(),
        website: website || 'Site non spécifié',
        password: password,
        strength: strength,
        date: new Date().toLocaleDateString('fr-FR')
    };

    savedPasswords.push(passwordObj);
    updatePasswordsList();
    updateStats();
}

// =================================
// 9. COPIE DANS LE PRESSE-PAPIERS
// =================================
/**
 * Copie un texte dans le presse-papiers avec feedback visuel
 * @param {string} text - Le texte à copier
 * @param {Event} event - L'événement déclencheur
 */
async function copyToClipboard(text, event) {
    try {
        await navigator.clipboard.writeText(text);
        const btn = event.target;
        const originalText = btn.textContent;

        btn.textContent = 'Copié!';
        btn.classList.add('bg-green-500');

        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('bg-green-500');
        }, 1000);
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        alert('Impossible de copier automatiquement. Veuillez copier manuellement.');
    }
}

// =================================
// 10. SUPPRESSION DE MOTS DE PASSE
// =================================
/**
 * Supprime un mot de passe de la liste
 * @param {number} id - L'ID unique du mot de passe
 */
function deletePassword(id) {
    savedPasswords = savedPasswords.filter(p => p.id !== id);
    updatePasswordsList();
    updateStats();
}

// =================================
// 11. MISE À JOUR DE LA LISTE
// =================================
/**
 * Met à jour l'affichage de la liste des mots de passe sauvegardés
 */
function updatePasswordsList() {
    if (savedPasswords.length === 0) {
        passwordsList.innerHTML = `
            <div class="text-center text-gray-500 text-sm py-4">
                Aucun mot de passe sauvegardé
            </div>
        `;
        return;
    }

    passwordsList.innerHTML = savedPasswords.map(p => `
        <div class="border-l-4 border-${p.strength.color.split('-')[1]}-500 bg-gray-50 p-3 rounded-r-lg fade-in">
            <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 truncate">${p.website}</div>
                    <div class="text-sm text-gray-500">
                        Créé le ${p.date}<br>
                        Force: ${p.strength.score}/100
                        <span class="inline-block w-2 h-2 rounded-full ${p.strength.color} ml-1"></span>
                    </div>
                </div>
                <div class="flex gap-2 ml-2">
                    <button onclick="copyToClipboard('${p.password}', event)"
                            class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition">
                        Copier
                    </button>
                    <button onclick="deletePassword(${p.id})"
                            class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition">
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// =================================
// 12. MISE À JOUR DES STATISTIQUES
// =================================
/**
 * Calcule et affiche les statistiques des mots de passe sauvegardés
 */
function updateStats() {
    totalCount.textContent = savedPasswords.length;
    const strongPasswords = savedPasswords.filter(p => p.strength.score >= 70);
    strongCount.textContent = strongPasswords.length;

    if (savedPasswords.length > 0) {
        const avgLen = savedPasswords.reduce((sum, p) => sum + p.password.length, 0) / savedPasswords.length;
        avgLength.textContent = Math.round(avgLen);
    } else {
        avgLength.textContent = '0';
    }
}

// =================================
// 13. EVENT LISTENER PRINCIPAL
// =================================
generateBtn.addEventListener('click', function() {
    const password = generatePassword();
    if (password) {
        showStrength(password);
        const website = websiteInput.value.trim();
        savePassword(website, password);

        this.textContent = 'Mot de passe généré et sauvegardé !';
        this.classList.add('bg-green-600');

        setTimeout(() => {
            this.textContent = 'Générer un mot de passe';
            this.classList.remove('bg-green-600');
        }, 2000);
    }
});

// =================================
// 14. INITIALISATION
// =================================
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    console.log('Générateur de mots de passe initialisé avec succès!');
});
