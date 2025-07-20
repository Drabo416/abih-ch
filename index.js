/**
 * Génère une configuration de prompt avec validation stricte du JSON et vérification documentaire
 * @param {Object} params - Paramètres d'entrée
 * @returns {Object} - Configuration complète pour l'IA
 */

// Exemple d'utilisation
const promptConfig = generateStrictPlanningPrompt({
  animalType: 'bovins',
  animalCount: 120,
  conditionArriver: 'Bon',
  localite: 'Bouaké',
});

console.log('=== SYSTEM MESSAGE ===');
console.log(promptConfig.systemMessage);
console.log('\n=== EXEMPLE DE SORTIE ===');
console.log(promptConfig.examples.validOutput);
