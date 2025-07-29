const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Serveur Maître Benarab - Mode Localhost');
console.log(`🌍 Port: ${PORT}`);

// Middleware de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    }
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Règles de validation
const contactValidationRules = [
    body('nom')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ\- ]{2,50}$/)
        .withMessage('Le nom doit contenir entre 2 et 50 caractères, uniquement des lettres, accents et tirets'),
    
    body('prénom')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ\- ]{2,50}$/)
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères, uniquement des lettres, accents et tirets'),
    
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Veuillez entrer une adresse email valide'),
    
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Le message doit contenir entre 10 et 1000 caractères')
        .escape() // Protection contre les injections XSS
];

// Fonction pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Erreurs de validation',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }
    next();
};

// Route pour servir la page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route API pour le formulaire de contact
app.post('/api/contact', contactValidationRules, handleValidationErrors, async (req, res) => {
    try {
        const { nom, prénom, email, message } = req.body;
        
        // Log des données reçues (pour debug)
        console.log('📧 Nouveau message reçu:', {
            nom,
            prénom,
            email,
            message: message.substring(0, 100) + '...' // Log partiel pour la sécurité
        });

        // Ici vous pouvez ajouter la logique pour :
        // 1. Sauvegarder en base de données
        // 2. Envoyer un email
        // 3. Notifier l'administrateur
        
        // Simulation d'un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Réponse de succès
        res.status(200).json({
            success: true,
            message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
            data: {
                nom,
                prénom,
                email,
                timestamp: new Date().toISOString(),
                environment: 'Localhost'
            }
        });

    } catch (error) {
        console.error('❌ Erreur lors du traitement du formulaire:', error);
        res.status(500).json({
            success: false,
            message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.'
        });
    }
});

// Route pour vérifier la santé du serveur
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: 'Localhost',
        mode: 'Développement'
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré avec succès !`);
    console.log(`🌐 Page principale: http://localhost:${PORT}`);
    console.log(`📧 API contact: http://localhost:${PORT}/api/contact`);
    console.log(`🏥 API santé: http://localhost:${PORT}/api/health`);
    console.log(`📝 Logs en temps réel ci-dessous...`);
    console.log('─'.repeat(50));
}); 
