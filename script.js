document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const form = document.getElementById('contact-form');
    const nom = document.getElementById('nom');
    const prenom = document.getElementById('prenom');
    const email = document.getElementById('email');
    const message = document.getElementById('message');

    if (!form) return;

    // Fonctions d’erreur
    function showError(input, message) {
        const formGroup = input.parentElement;
        let errorDiv = formGroup.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.setAttribute('aria-live', 'polite');
            formGroup.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        input.classList.add('error');
    }

    function clearError(input) {
        const formGroup = input.parentElement;
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            formGroup.removeChild(errorDiv);
        }
        input.classList.remove('error');
    }

    function getErrorMessage(key) {
        if (window.translations && window.currentLanguage) {
            return window.translations[window.currentLanguage][key] || key;
        }
        const errorMessages = {
            'error_name': 'Nom invalide : 2 à 50 lettres, accents et tirets autorisés',
            'error_email': 'Veuillez entrer un email valide',
            'error_message': 'Le message doit contenir entre 10 et 1000 caractères',
            'success_message': 'Message doit avoir au moins 10  !'
        };
        return errorMessages[key] || key;
    }

    // Validation en temps réel
    nom.addEventListener('input', function() {
        clearError(nom);
        if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\- ]{2,50}$/.test(this.value)) {
            showError(this, getErrorMessage('error_name'));
        }
    });

    prenom.addEventListener('input', function() {
        clearError(prenom);
        if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\- ]{2,50}$/.test(this.value)) {
            showError(this, getErrorMessage('error_name'));
        }
    });

    email.addEventListener('input', function() {
        clearError(email);
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(this.value)) {
            showError(this, getErrorMessage('error_email'));
        }
    });

    message.addEventListener('input', function() {
        clearError(message);
        if (this.value.length < 10 || this.value.length > 1000) {
            showError(this, getErrorMessage('error_message'));
        }
    });

    // Validation à la soumission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        let hasError = false;
        clearError(nom);
        clearError(prenom);
        clearError(email);
        clearError(message);

        // Validation côté client (double vérification)
        if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\- ]{2,50}$/.test(nom.value)) {
            showError(nom, getErrorMessage('error_name'));
            hasError = true;
        }
        if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\- ]{2,50}$/.test(prenom.value)) {
            showError(prenom, getErrorMessage('error_name'));
            hasError = true;
        }
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email.value)) {
            showError(email, getErrorMessage('error_email'));
            hasError = true;
        }
        if (message.value.length < 10 || message.value.length > 1000) {
            showError(message, getErrorMessage('error_message'));
            hasError = true;
        }
        if (hasError) return;

        // Désactiver le bouton pendant l'envoi
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Envoi en cours...';

        try {
            // Préparation des données pour l'API
            const formData = {
                nom: nom.value.trim(),
                prénom: prenom.value.trim(),
                email: email.value.trim(),
                message: message.value.trim()
            };

            // Envoi à l'API backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Succès
                const successDiv = document.createElement('div');
                successDiv.className = 'alert alert-success mt-3';
                successDiv.setAttribute('role', 'alert');
                successDiv.innerHTML = `
                    <i class="fa fa-check-circle"></i>
                    ${result.message}
                `;
                form.parentElement.insertBefore(successDiv, form);
                
                // Suppression du message après 5 secondes
                setTimeout(() => {
                    if (successDiv.parentElement) {
                        successDiv.parentElement.removeChild(successDiv);
                    }
                }, 5000);
                
                // Réinitialisation du formulaire
                form.reset();
            } else {
                // Erreurs de validation backend
                if (result.errors && Array.isArray(result.errors)) {
                    result.errors.forEach(error => {
                        let field;
                        switch (error.field) {
                            case 'nom':
                                field = nom;
                                break;
                            case 'prénom':
                                field = prenom;
                                break;
                            case 'email':
                                field = email;
                                break;
                            case 'message':
                                field = message;
                                break;
                        }
                        if (field) {
                            showError(field, error.message);
                        }
                    });
                } else {
                    // Erreur générale
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'alert alert-danger mt-3';
                    errorDiv.setAttribute('role', 'alert');
                    errorDiv.innerHTML = `
                        <i class="fa fa-exclamation-triangle"></i>
                        ${result.message || 'Une erreur est survenue lors de l\'envoi du message.'}
                    `;
                    form.parentElement.insertBefore(errorDiv, form);
                    
                    setTimeout(() => {
                        if (errorDiv.parentElement) {
                            errorDiv.parentElement.removeChild(errorDiv);
                        }
                    }, 5000);
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            
            // Erreur de connexion
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.setAttribute('role', 'alert');
            errorDiv.innerHTML = `
                <i class="fa fa-exclamation-triangle"></i>
                Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.
            `;
            form.parentElement.insertBefore(errorDiv, form);
            
            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.parentElement.removeChild(errorDiv);
                }
            }, 5000);
        } finally {
            // Réactiver le bouton
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
});