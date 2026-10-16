# GEKKO — UI Control 0.1.8

Module léger pour Foundry VTT V14 dédié à la personnalisation ergonomique de l’interface.

## Installation via Foundry

Dans Foundry VTT, ouvre **Add-on Modules → Install Module** puis colle cette URL de manifeste :

`https://raw.githubusercontent.com/thegexgekko/gekko-ui-scale/main/module.json`

Foundry pourra ensuite détecter les futures mises à jour via ce manifeste stable.

> L’identifiant technique du module reste `gekko-ui-scale` afin de préserver les installations existantes et les mises à jour automatiques.

## Réglages disponibles

Dans **Paramètres de la partie → Configurer les paramètres → Paramètres des modules → GEKKO — UI Control** :

1. **Taille de la barre d’outils gauche**
   - Contrôle uniquement la barre d’outils verticale de gauche.

2. **Écartement des boutons de la barre gauche**
   - Ajuste l’espace entre les boutons de gauche de **-10 px à +20 px**.
   - **0 px** conserve l’écartement normal de Foundry.

3. **Taille de la barre d’onglets droite**
   - Contrôle uniquement les boutons d’onglets de la barre latérale droite.

4. **Écartement des boutons de la barre droite**
   - Ajuste l’espace entre les boutons de la barre d’onglets droite de **-10 px à +20 px**.
   - **0 px** conserve l’écartement normal de Foundry.

5. **Taille du contenu du panneau droit**
   - Contrôle uniquement le contenu du panneau sélectionné à droite : chat, acteurs, scènes, paramètres, etc.

6. **Masquage automatique de la barre d’accès rapide**
   - Masque la hotbar lorsqu’elle n’est pas utilisée.
   - Elle réapparaît lorsque le curseur entre dans la zone de révélation au bas de l’écran.

7. **Hauteur de la zone de révélation**
   - Réglable de **1 à 100 px**.
   - Valeur par défaut : **12 px**.

8. **Délai avant masquage**
   - Réglable de **0 à 5000 ms**, par pas de **100 ms**.
   - Valeur par défaut : **2000 ms**.

9. **Position de la barre d’accès rapide**
   - **Standard Foundry**
   - **Bas de l’écran — gauche**
   - **Bas de l’écran — centre**
   - **Bas de l’écran — droite**

Les réglages sont indépendants et enregistrés côté client.

## Compatibilité avec les modules de hotbar

GEKKO — UI Control propose des fonctions similaires à certains modules spécialisés de gestion de hotbar. Pour éviter que deux modules essaient de déplacer ou masquer la barre en même temps, il est recommandé de désactiver les fonctions équivalentes des autres modules.

## Historique

### 0.1.8
- Nouveau nom public : **GEKKO — UI Control**.
- Conservation de l’identifiant technique `gekko-ui-scale`, du dépôt GitHub et de l’URL du manifeste afin de ne pas casser les mises à jour existantes.
- Aucun changement fonctionnel par rapport à la 0.1.7.

### 0.1.7
- Ajout du masquage automatique de la barre d’accès rapide.
- Ajout du réglage de la hauteur de la zone de révélation.
- Ajout du réglage du délai avant masquage.
- Ajout de quatre positions : Standard Foundry, bas gauche, bas centre et bas droite.
- Tous les nouveaux réglages sont enregistrés côté client et restent désactivés ou neutres par défaut.

### 0.1.6
- Correction de l’écartement négatif sur la barre d’onglets droite.
- Correction de l’écartement partiel sur la barre gauche.
- L’écartement se base désormais sur la position visuelle réelle des boutons au lieu de dépendre uniquement de leurs classes CSS.
- Meilleure prise en charge des contrôles ajoutés par des modules tiers et des barres sur plusieurs colonnes ou plusieurs lignes.

### 0.1.5
- Ajout d’un réglage indépendant de l’écartement des boutons de la barre gauche.
- Ajout d’un réglage indépendant de l’écartement des boutons de la barre droite.
- 0 px conserve l’espacement natif de Foundry ; les valeurs négatives rapprochent les boutons et les valeurs positives les éloignent.

### 0.1.4
- Ajout des métadonnées GitHub nécessaires à l’installation et aux mises à jour automatiques de Foundry.
- Ajout d’une publication automatique des releases GitHub.
- Aucun changement fonctionnel des réglages de mise à l’échelle.

### 0.1.3
- Ajout d’un troisième réglage indépendant pour le contenu du panneau droit.
- Conservation du réglage séparé des onglets de droite.
- Aucun redimensionnement global de `#ui-right`.

### 0.1.2
- Le réglage de droite ne redimensionne plus tout `#ui-right`.
- Les onglets de droite et le contenu ne sont plus liés.
