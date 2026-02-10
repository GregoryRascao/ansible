#!/bin/bash

# Vérifie si git est installé
if ! command -v git &> /dev/null
then
    echo "Erreur: git n'est pas installé sur votre système."
    exit 1
fi

# Récupère la liste des tags et la stocke dans un tableau
tags=$(git tag --sort=v:refname)
if [ -z "$tags" ]; then
    echo "Aucun tag trouvé dans ce dépôt."
    exit 0
fi
tag_array=($(echo "$tags"))

# Affiche la liste des tags avec des numéros pour la sélection
echo "Tags Git disponibles :"
for i in "${!tag_array[@]}"; do
    echo "$((i+1)) - ${tag_array[$i]}"
done

# Invite l'utilisateur à sélectionner un tag
read -p "Veuillez sélectionner le numéro du tag souhaité : " tag_choice

# Vérifie si l'entrée de l'utilisateur est valide
if ! [[ "$tag_choice" =~ ^[0-9]+$ ]] || (( tag_choice < 1 || tag_choice > ${#tag_array[@]} )); then
    echo "Choix invalide. Veuillez entrer un numéro valide."
    exit 1
fi

# Obtient le nom du tag sélectionné
selected_tag="${tag_array[$((tag_choice-1))]}"
echo "Vous avez sélectionné le tag : $selected_tag"

# Checkout du tag sélectionné
echo "Récupération du code à la version du tag '$selected_tag'..."
if ! git checkout "$selected_tag" &> /dev/null; then
    echo "Erreur lors du checkout du tag '$selected_tag'."
    exit 1
fi

echo "Code à la version du tag '$selected_tag'."

# Demande le nouvel URL du dépôt Git
read -p "Veuillez entrer la nouvelle URL du dépôt Git distant : " new_remote_url

# Supprime l'ancien remote (si il existe)
if git remote get-url origin &> /dev/null; then
    echo "Suppression de l'ancien remote 'origin'..."
    git remote remove origin
fi

# Ajoute le nouveau remote
echo "Ajout du nouveau remote 'origin' avec l'URL : $new_remote_url"
if ! git remote add origin "$new_remote_url" &> /dev/null; then
    echo "Erreur lors de l'ajout du nouveau remote."
    exit 1
fi

echo "Le dépôt Git a été réinitialisé pour pointer vers : $new_remote_url"
echo "Votre code local est à l'état du tag : $selected_tag"

exit 0
