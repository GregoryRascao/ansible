# Documentation des Plugins

Cette documentation détaille la configuration et l'utilisation des différents plugins disponibles dans le système.

---

## Utilisation de JSONPath

Certains plugins utilisent des expressions JSONPath pour extraire ou manipuler des données au sein de structures JSON
complexes.

### Plugins utilisant JSONPath

- **Mapping (Json2Json)** : Utilise JSONPath pour extraire les valeurs sources lors de la transformation.
- **Unwind (Json Unwind)** : Utilise JSONPath pour cibler le tableau à "dérouler".
- **Group (Json Group)** : Utilise JSONPath pour définir les clés de regroupement.
- **Object to Array** : Utilise JSONPath pour transformer des objets en tableaux.
- **Group to CSV** : Peut utiliser JSONPath pour générer dynamiquement des noms de fichiers.

### Syntaxe de base

- `$` : Représente l'objet ou l'élément racine.
- `.` ou `[]` : Permet de descendre dans la hiérarchie (ex: `$.nom` ou `$['nom']`).
- `*` : Joker pour tous les éléments d'un objet ou d'un tableau.
- `[n]` : Accède au n-ième élément d'un tableau (commence à 0).
- `[?(@.propriete == 'valeur')]` : Filtre les éléments selon une condition.

### Exemples concrets

Si votre donnée source ressemble à ceci :

```json
{
  "client": {
    "nom": "Dupont",
    "commandes": [
      {
        "id": 1,
        "total": 50
      },
      {
        "id": 2,
        "total": 120
      }
    ]
  }
}
```

- `$.client.nom` retournera "Dupont".
- `$.client.commandes[*].total` retournera la liste des totaux `[50, 120]`.
- `$.client.commandes[0]` retournera la première commande.

### Fonctions avancées

En plus de la syntaxe standard, vous pouvez exécuter des fonctions directement dans vos expressions JSONPath pour
transformer les données extraites :

#### Agrégations :

- `$.commandes[*].total.sum()` : Calcule la somme des totaux.
- `$.commandes[*].total.avg()` : Calcule la moyenne des totaux.
- `$.commandes[*].total.min()` / `.max()` : Trouve la valeur minimale ou maximale.

#### Utilitaires :

- `$.commandes.length()` : Retourne le nombre d'éléments dans le tableau.

Ces fonctions sont particulièrement utiles dans les plugins de Mapping pour consolider des données avant l'envoi vers
une destination.

### Expressions JavaScript (Arrow Functions)

Pour les cas de transformation plus complexes ou critiques, vous pouvez utiliser une syntaxe de fonction fléchée
JavaScript. L'objet courant est accessible via la variable `it`.

**Syntaxe :** `(it) => expression`

**Exemples :**

- `(it) => it.name + ' ' + it.lastDate.toJson()` : Concatène le nom et la date formatée.
- `(it) => it.prix * 1.21` : Calcule un prix TTC directement.
- `(it) => it.statut.toUpperCase()` : Met le statut en majuscules.

Cette notation offre une flexibilité totale pour manipuler les données en utilisant toute la puissance de JavaScript.

---

## Métadonnées du Workflow

### Configuration des Métadonnées

Définit les paramètres généraux du workflow.

**Champs :**

- **Workflow name** : Nom unique du workflow.
- **Cron expression** : Fréquence d'exécution (format: ms s m h D M).
- **Folder** : Dossier de classement.
- **Active** : Active ou désactive l'exécution automatique.

---

## Sources

### MySQL Source

Ce plugin permet d'extraire des données d'une base de données MySQL.

**Champs principaux :**

- **Host / Port / Username / Password / Database** : Informations de connexion standard.
- **Custom SQL Query** : Permet de saisir une requête SQL brute. Si rempli, il remplace la construction
  structurée ($select, $from, etc.).
- **$select / $from / $join / $where** : Permettent de construire une requête SQL de manière structurée via l'interface.
- **$limit / $offset** : Pour la pagination des résultats.

### API Source

Permet de récupérer des données via une requête HTTP.

**Configuration :**

- **URL** : L'adresse de l'API.
- **Method** : GET, POST, PUT, etc.
- **Headers** : Liste de clés/valeurs pour les entêtes HTTP.
- **Body Parameters** : Paramètres envoyés dans le corps de la requête (format JSON).

### FTP Source

Permet de télécharger des fichiers depuis un serveur FTP.

**Options :**

- **Host / Port / Username / Password** : Connexion au serveur.
- **Remote path** : Chemin vers le fichier ou le dossier sur le serveur.
- **Filter (Regex)** : Expression régulière pour filtrer les fichiers à télécharger.
- **Is directory ?** : Cochez si le chemin distant est un dossier.
- **Secured ?** : Utiliser une connexion sécurisée (FTPS).

### MongoDB Source

Extrait des données d'une collection MongoDB en utilisant un pipeline d'agrégation.

**Paramètres :**

- **Connexion** : Host, Port, Username, Password, Database.
- **Collection** : Nom de la collection cible.
- **Query (Pipeline)** : Liste d'étapes d'agrégation ($match, $sort, $project, etc.). Chaque étape nécessite un
  opérateur et une expression JSON valide.

### SFTP Source

Récupère des fichiers via le protocole SFTP (SSH File Transfer Protocol).

**Champs :**

- **Connexion** : Host, Port (par défaut 22), Username, Password.
- **Remote path** : Chemin absolu vers le fichier ou dossier.
- **Is directory ?** : Indique si la source est un répertoire.
- **Filter (Regex)** : Filtrage des noms de fichiers par expression régulière.
- **Archived ?** : Si coché, les fichiers traités peuvent être marqués comme archivés.

---

## Transformateurs

### CSV to JSON

Transforme un contenu CSV en objets JSON.

**Paramètres :**

- **Separator** : Caractère de séparation (ex: `;` ou `,`).
- **Line delimiter** : Délimiteur de fin de ligne (\n ou \r\n).
- **Parts** : Permet de définir différentes sections du CSV à extraire.
  - **Header line** : Numéro de la ligne contenant les titres.
  - **Header name** : Nom de la clé JSON pour cette partie.
  - **Slice** : Début et fin de l'extraction des données.

### Group to CSV

Génère plusieurs fichiers CSV à partir de données groupées.

**Champs :**

- **Filename** : Nom de base du fichier. Peut utiliser un chemin JSON (ex: `$.nom`) ou une fonction.
- **Separator** : Caractère séparateur.
- **Timestamp** : Ajoute la date actuelle au nom du fichier.
- **Time format** : Format de la date si Timestamp est activé.

*Ce plugin supporte les expressions JSONPath pour le nom de fichier.*

### JSON Group

Groupe un tableau d'objets JSON selon une règle spécifique.

**Règle (Rule) :**

- **JSONPath** : Ex: `$.client.id` pour grouper par ID client.
- **Javascript** : Une fonction eval permettant de définir une logique de groupage personnalisée.

### JSON Unwind

Déplie un tableau contenu dans un objet JSON pour créer plusieurs objets (similaire à $unwind de MongoDB).

**Paramètres :**

- **Fields** : Liste des champs (via JSONPath) à déplier.

### JSON to CSV

Convertit un tableau d'objets JSON en un fichier CSV.

**Options :**

- **Filename** : Nom du fichier de sortie.
- **Separator** : Caractère séparateur (ex: `;`).
- **Timestamp** : Ajoute un horodatage au nom du fichier.
- **Time format** : Format de l'horodatage.

### JSON to JSON (Mapping)

Réapplique une structure JSON différente à partir des données d'entrée.

**Fonctionnement :**

- **Date format** : Format de date cible.
- **Mapping rules** : Liste des règles de transformation.
  - **Destination field** : Nom du champ dans l'objet de sortie.
  - **Mapping rule** :
    - Commence par `$` : JSONPath (ex: `$.data.valeur`).
    - Sinon : Code Javascript (ex: `(item) => item.valeur * 2`).
  - **Source type** : Indique si la source est une date pour appliquer un reformatage.

### JSON Group to JSON

Applique des règles de mapping sur des données groupées.

**Paramètres :**

- **Date format** : Formatage des dates.
- **Mapping rules** : Liste de règles à appliquer sur chaque groupe.

### Object to Array

Transforme les propriétés d'un objet en un tableau d'objets. Utile pour convertir des objets indexés par clé en une
liste exploitable.

**Champs :**

- **Fields** : Liste des correspondances.
  - **Source** : Chemin vers l'objet source (ex: `$.valeurs`).
  - **Target** : Nom du champ cible.

---

## Destinations

### FTP Destination

Envoie les fichiers générés vers un serveur FTP.

**Paramètres :**

- **Connexion** : Host, Port, Username, Password.
- **Remote path** : Répertoire de destination sur le serveur.
- **Secured ?** : Utiliser FTPS.

### MongoDB Destination

Insère les données JSON dans une collection MongoDB.

**Paramètres :**

- **Host / Port / Username / Password** : Informations de connexion.
- **DB / Collection** : Base de données et collection de destination.

### SFTP Destination

Téléverse les fichiers vers un serveur via SFTP.

**Paramètres :**

- **Connexion** : Host, Port, Username, Password.
- **Remote path** : Répertoire de destination.
