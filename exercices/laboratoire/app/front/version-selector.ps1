# Vérifie si Git est installé
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Erreur: git n'est pas installé sur votre système."
  exit 1
}

# Récupère la liste des tags et la stocke dans un tableau
$tags = git tag --sort=v:refname
if ([string]::IsNullOrEmpty($tags)) {
  Write-Host "Aucun tag trouvé dans ce dépôt."
  exit 0
}
$tag_array = $tags.Split("`n")

# Affiche la liste des tags avec des numéros pour la sélection
Write-Host "Tags Git disponibles :"
for ($i = 0; $i -lt $tag_array.Count; $i++) {
  Write-Host "$($i + 1) - $($tag_array[$i])"
}

# Invite l'utilisateur à sélectionner un tag
$tag_choice = Read-Host "Veuillez sélectionner le numéro du tag souhaité"

# Vérifie si l'entrée de l'utilisateur est valide
if ($tag_choice -notmatch '^[0-9]+$' -or $tag_choice -lt 1 -or $tag_choice -gt $tag_array.Count) {
  Write-Error "Choix invalide. Veuillez entrer un numéro valide."
  exit 1
}

# Obtient le nom du tag sélectionné
$selected_tag = $tag_array[$tag_choice - 1]
Write-Host "Vous avez sélectionné le tag : $selected_tag"

# Checkout du tag sélectionné
Write-Host "Récupération du code à la version du tag '$selected_tag'..."
if ((git checkout "$selected_tag") -like "*error*") {
  Write-Error "Erreur lors du checkout du tag '$selected_tag'."
  exit 1
}

Write-Host "Code à la version du tag '$selected_tag'."

# Demande le nouvel URL du dépôt Git
$new_remote_url = Read-Host "Veuillez entrer la nouvelle URL du dépôt Git distant"

# Supprime l'ancien remote (si il existe)
if ($null -ne (git remote get-url origin -ErrorAction SilentlyContinue)) {
  Write-Host "Suppression de l'ancien remote 'origin'..."
  git remote remove origin
}

# Ajoute le nouveau remote
Write-Host "Ajout du nouveau remote 'origin' avec l'URL : $new_remote_url"
if ((git remote add origin "$new_remote_url") -like "*error*") {
  Write-Error "Erreur lors de l'ajout du nouveau remote."
  exit 1
}

Write-Host "Le dépôt Git a été réinitialisé pour pointer vers : $new_remote_url"
Write-Host "Votre code local est à l'état du tag : $selected_tag"

exit 0
