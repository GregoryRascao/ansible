🏗️ Projet Final : "L'Usine Docker-Cloud Sécurisée"
Durée : 15 heures

Cible : Azure (VMs & PaaS) + Docker Engine.

🎯 Le Scénario
Votre entreprise souhaite migrer une application "Legacy" vers une architecture hybride :

Le Front-end : Déployé sur des VMs Azure isolées via Docker Compose.

Le Back-end : Une base de données managée sur Azure (Azure SQL ou MySQL).

La Sécurité : Tout le trafic doit passer par un bastion, et les secrets sont gérés par Ansible Vault.

📝 Guide de Correction & Énoncé Détaillé
Phase 1 : Provisioning Cloud (4h)
Objectif : Créer l'infrastructure d'accueil sur Azure.

Tâche 1 : Créer un Virtual Network (VNET) et deux sous-réseaux (Public/Privé).

Tâche 2 : Provisionner 2 VMs Linux (Ubuntu) qui serviront d'hôtes Docker.

Tâche 3 : Configurer un Inventaire Dynamique Azure (azure_rm) pour cibler les VMs par "tags" (ex: env: production).

Critère de réussite : La commande ansible-inventory --graph doit afficher dynamiquement les hôtes Azure.

Phase 2 : Configuration & Dockerisation (4h)
Objectif : Préparer les nœuds pour le runtime.

Tâche 1 (Rôle docker_setup) : Installation de Docker Engine, Docker Compose et configuration du démon (logs, stockage). 

Tâche 2 (Sécurité) : Hardening OS (SSH, Fail2Ban) et limitation des accès Docker au groupe docker uniquement.

Tâche 3 : Configuration d'un registre privé (Azure Container Registry - ACR) pour stocker les images.

Phase 3 : Déploiement Applicatif "Multi-Container" (5h)
Objectif : Déployer une application complexe via Ansible.

Tâche 1 : Utilisation du module community.docker.docker_compose pour déployer une pile (App + Redis + Nginx reverse proxy).

Tâche 2 : Gestion des certificats SSL (Auto-signés ou Let's Encrypt) via Ansible pour sécuriser le Nginx.

Tâche 3 : Utilisation de Jinja2 pour rendre le fichier docker-compose.yml dynamique (image tags, variables d'environnement).

Phase 4 : Maintenance & CI/CD (2h)
Objectif : Automatiser le "Day 2".

Tâche 1 : Créer un Playbook de "Rollback" qui permet de revenir à la version précédente de l'image Docker en un clic.

Tâche 2 : Mise en place d'un Healthcheck via le module uri d'Ansible pour valider que l'application répond en 200 OK après déploiement.