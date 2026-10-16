# GEKKO — UI Scale 0.1.6

Module léger pour Foundry VTT V14.

## Installation via Foundry

Dans Foundry VTT, ouvre **Add-on Modules → Install Module** puis colle cette URL de manifeste :

`https://raw.githubusercontent.com/thegexgekko/gekko-ui-scale/main/module.json`

Foundry pourra ensuite détecter les futures mises à jour via ce manifeste stable.

## Réglages disponibles

Dans **Paramètres de la partie → Configurer les paramètres → Paramètres des modules → GEKKO — UI Scale** :

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

Les réglages de taille vont de **50 % à 200 %**, par pas de **5 %**. Les réglages d’écartement vont de **-10 px à +20 px**, par pas de **1 px**.

Tous les réglages sont indépendants et enregistrés côté client.

## Historique

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
