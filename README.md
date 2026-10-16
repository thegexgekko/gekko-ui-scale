# GEKKO — UI Scale 0.1.4

Module léger pour Foundry VTT V14.

## Installation via Foundry

Dans Foundry VTT, ouvre **Add-on Modules → Install Module** puis colle cette URL de manifeste :

`https://raw.githubusercontent.com/thegexgekko/gekko-ui-scale/main/module.json`

Foundry pourra ensuite détecter les futures mises à jour via ce manifeste stable.

## Réglages disponibles

Dans **Paramètres de la partie → Configurer les paramètres → Paramètres des modules → GEKKO — UI Scale** :

1. **Taille de la barre d’outils gauche**
   - Contrôle uniquement la barre d’outils verticale de gauche.

2. **Taille de la barre d’onglets droite**
   - Contrôle uniquement les boutons d’onglets de la barre latérale droite.

3. **Taille du contenu du panneau droit**
   - Contrôle uniquement le contenu du panneau sélectionné à droite : chat, acteurs, scènes, paramètres, etc.

Chaque réglage va de **50 % à 200 %**, par pas de **5 %**.

Les trois réglages sont indépendants et enregistrés côté client.

## Historique

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
