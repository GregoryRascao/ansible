#[Laboratoire] Usine Docker-Cloud Securisee (Bicep + Ansible)

Ce document suit strictement `exervices/laboratoire/labo.md`. Chaque phase et tache est reprise dans le meme ordre, avec explications et commentaires. Aucun ajout hors consignes.

## Scenario (resume du labo)
1. Front-end deploye sur VMs Azure via Docker Compose.
2. Back-end sur base de donnees manag�e Azure (Azure SQL ou MySQL).
3. Securite: tout le trafic passe par un bastion, secrets dans Ansible Vault.

## Prerequis
1. Azure CLI installe et connecte.
2. Bicep disponible via Azure CLI.
3. Ansible installe + collections `azure.azcollection` et `community.docker`.
4. Sources applicatives dans `exervices/laboratoire/app/`.

Commandes de base (terminal):
```bash
az login
az account show
az bicep version
```

## Cle SSH (necessaire pour `sshPublicKey`)
Le parametre `sshPublicKey` est utilise par les VMs. Il faut donc generer une cle publique SSH avant de remplir `dev.bicepparam`.

Commande (terminal):
```bash
ssh-keygen -t ed25519 -C "lab-devops" -f ~/.ssh/lab_devops
```

Recuperer la cle publique:
```bash
cat ~/.ssh/lab_devops.pub
```

Ensuite, coller cette valeur dans `sshPublicKey` dans `exervices/laboratoire/infra/params/dev.bicepparam`.

## Arborescence a creer
Commande a executer dans un terminal:

```text
exervices/laboratoire/
  infra/
    main.bicep
    modules/
      network.bicep
      compute.bicep
    params/
      dev.bicepparam
  ansible/
    ansible.cfg
    inventory/
      azure_rm.yml
    group_vars/
      all.yml
    playbooks/
      site.yml
      rollback.yml
      healthcheck.yml
    roles/
      docker_setup/
        tasks/main.yml
      hardening/
        tasks/main.yml
        handlers/main.yml
      app_deploy/
        tasks/main.yml
        templates/docker-compose.yml.j2
        files/nginx.conf
```

# Phase 1 : Provisioning Cloud (4h)
Objectif: creer l'infrastructure d'accueil sur Azure.

## Tache 1 : Creer un VNET et deux sous-reseaux (Public/Prive)

### 1.1 Fichier `exervices/laboratoire/infra/modules/network.bicep`
Emplacement: `exervices/laboratoire/infra/modules/network.bicep`
```bicep
// Module reseau: VNet + 2 subnets
param location string
param prefix string

resource vnet 'Microsoft.Network/virtualNetworks@2023-11-01' = {
  name: '${prefix}-vnet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.10.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'public'
        properties: {
          addressPrefix: '10.10.1.0/24'
        }
      }
      {
        name: 'private'
        properties: {
          addressPrefix: '10.10.2.0/24'
        }
      }
    ]
  }
}

// Outputs reutilises par les autres modules
output vnetId string = vnet.id
output publicSubnetId string = vnet.properties.subnets[0].id
output privateSubnetId string = vnet.properties.subnets[1].id
```

### 1.2 Fichier `exervices/laboratoire/infra/main.bicep` (partie reseau)
Emplacement: `exervices/laboratoire/infra/main.bicep`
```bicep
// Parametres globaux
param location string = resourceGroup().location
param prefix string
param adminUsername string
@secure()
param adminPassword string
param sshPublicKey string

// Module reseau
module network 'modules/network.bicep' = {
  name: '${prefix}-network'
  params: {
    location: location
    prefix: prefix
  }
}
```

## Tache 2 : Provisionner 2 VMs Linux (Ubuntu) (hotes Docker)

### 2.1 Fichier `exervices/laboratoire/infra/modules/compute.bicep`
Emplacement: `exervices/laboratoire/infra/modules/compute.bicep`
```bicep
// Module compute: bastion + 2 VMs Docker (bastion exige par le scenario)
param location string
param prefix string
param adminUsername string
@secure()
param adminPassword string
param sshPublicKey string
param publicSubnetId string
param privateSubnetId string

var vmSize = 'Standard_B2s'
var imageRef = {
  publisher: 'Canonical'
  offer: '0001-com-ubuntu-server-jammy'
  sku: '22_04-lts-gen2'
  version: 'latest'
}

// Bastion: VM publique pour acceder aux VMs privees
resource bastionIp 'Microsoft.Network/publicIPAddresses@2023-11-01' = {
  name: '${prefix}-bastion-pip'
  location: location
  sku: {
    name: 'Standard'
  }
  properties: {
    publicIPAllocationMethod: 'Static'
  }
}

resource bastionNic 'Microsoft.Network/networkInterfaces@2023-11-01' = {
  name: '${prefix}-bastion-nic'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          subnet: {
            id: publicSubnetId
          }
          privateIPAllocationMethod: 'Dynamic'
          publicIPAddress: {
            id: bastionIp.id
          }
        }
      }
    ]
  }
}

resource bastionVm 'Microsoft.Compute/virtualMachines@2023-09-01' = {
  name: '${prefix}-bastion'
  location: location
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    osProfile: {
      computerName: '${prefix}-bastion'
      adminUsername: adminUsername
      adminPassword: adminPassword
      linuxConfiguration: {
        disablePasswordAuthentication: false
        ssh: {
          publicKeys: [
            {
              path: '/home/${adminUsername}/.ssh/authorized_keys'
              keyData: sshPublicKey
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: imageRef
      osDisk: {
        createOption: 'FromImage'
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: bastionNic.id
        }
      ]
    }
  }
  tags: {
    role: 'bastion'
    env: 'production'
  }
}

// VMs Docker dans le subnet prive
resource dockerNic1 'Microsoft.Network/networkInterfaces@2023-11-01' = {
  name: '${prefix}-docker-nic-1'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          subnet: {
            id: privateSubnetId
          }
          privateIPAllocationMethod: 'Dynamic'
        }
      }
    ]
  }
}

resource dockerNic2 'Microsoft.Network/networkInterfaces@2023-11-01' = {
  name: '${prefix}-docker-nic-2'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          subnet: {
            id: privateSubnetId
          }
          privateIPAllocationMethod: 'Dynamic'
        }
      }
    ]
  }
}

resource dockerVm1 'Microsoft.Compute/virtualMachines@2023-09-01' = {
  name: '${prefix}-docker-1'
  location: location
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    osProfile: {
      computerName: '${prefix}-docker-1'
      adminUsername: adminUsername
      adminPassword: adminPassword
      linuxConfiguration: {
        disablePasswordAuthentication: false
        ssh: {
          publicKeys: [
            {
              path: '/home/${adminUsername}/.ssh/authorized_keys'
              keyData: sshPublicKey
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: imageRef
      osDisk: {
        createOption: 'FromImage'
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: dockerNic1.id
        }
      ]
    }
  }
  tags: {
    role: 'docker-host'
    env: 'production'
  }
}

resource dockerVm2 'Microsoft.Compute/virtualMachines@2023-09-01' = {
  name: '${prefix}-docker-2'
  location: location
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    osProfile: {
      computerName: '${prefix}-docker-2'
      adminUsername: adminUsername
      adminPassword: adminPassword
      linuxConfiguration: {
        disablePasswordAuthentication: false
        ssh: {
          publicKeys: [
            {
              path: '/home/${adminUsername}/.ssh/authorized_keys'
              keyData: sshPublicKey
            }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: imageRef
      osDisk: {
        createOption: 'FromImage'
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: dockerNic2.id
        }
      ]
    }
  }
  tags: {
    role: 'docker-host'
    env: 'production'
  }
}

// Outputs utiles pour Ansible
output bastionPublicIp string = bastionIp.properties.ipAddress
output dockerVmPrivateIps array = [
  dockerNic1.properties.ipConfigurations[0].properties.privateIPAddress
  dockerNic2.properties.ipConfigurations[0].properties.privateIPAddress
]
```

### 2.2 Mise a jour de `exervices/laboratoire/infra/main.bicep` (partie compute)
Emplacement: `exervices/laboratoire/infra/main.bicep`
```bicep
// Module compute: bastion + 2 VMs docker
module compute 'modules/compute.bicep' = {
  name: '${prefix}-compute'
  params: {
    location: location
    prefix: prefix
    adminUsername: adminUsername
    adminPassword: adminPassword
    sshPublicKey: sshPublicKey
    publicSubnetId: network.outputs.publicSubnetId
    privateSubnetId: network.outputs.privateSubnetId
  }
}

// Outputs utiles pour Ansible
output bastionPublicIp string = compute.outputs.bastionPublicIp
output dockerVmPrivateIps array = compute.outputs.dockerVmPrivateIps
```

### 2.3 Fichier `exervices/laboratoire/infra/params/dev.bicepparam`
Emplacement: `exervices/laboratoire/infra/params/dev.bicepparam`
```bicep
using '../main.bicep'

param location = 'westeurope'
param prefix = 'labdevops'
param adminUsername = 'azureuser'
param adminPassword = 'REPLACE_ME_STRONG_PASSWORD'
param sshPublicKey = 'ssh-rsa AAAA...'
```

### 2.4 Deploiement Bicep
```bash
cd exervices/laboratoire
az group create -n rg-lab-devops -l westeurope
az deployment group create -g rg-lab-devops -f infra/main.bicep -p infra/params/dev.bicepparam
```

Recuperer les sorties:
```bash
az deployment group show -g rg-lab-devops -n main --query properties.outputs
```

## Tache 3 : Inventaire Dynamique Azure (azure_rm)

### 3.1 Fichier `exervices/laboratoire/ansible/ansible.cfg`
Emplacement: `exervices/laboratoire/ansible/ansible.cfg`
```ini
[defaults]
inventory = inventory/azure_rm.yml
host_key_checking = False
retry_files_enabled = False
interpreter_python = auto
```

### 3.2 Fichier `exervices/laboratoire/ansible/inventory/azure_rm.yml`
Emplacement: `exervices/laboratoire/ansible/inventory/azure_rm.yml`
```yaml
# Inventaire dynamique Azure, base sur les tags
plugin: azure.azcollection.azure_rm
auth_source: cli
include_vm_resource_groups:
  - rg-lab-devops
keyed_groups:
  - key: tags.role
    prefix: role
  - key: tags.env
    prefix: env
plain_host_names: true
```

Test d'inventaire:
```bash
cd exervices/laboratoire/ansible
ansible-inventory --graph
```

### Depannage inventaire Azure (WSL)
Si tu vois des erreurs du type "Failed to import the required Python library (azure-cli)", installe Azure CLI dans WSL:
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

Si Ansible ignore `ansible.cfg` car le dossier est "world-writable", force la configuration:
```bash
export ANSIBLE_CONFIG=/mnt/c/Users/stgadmin/Documents/ansible/exercices/laboratoire/ansible/ansible.cfg
ansible-inventory -i /mnt/c/Users/stgadmin/Documents/ansible/exercices/laboratoire/ansible/inventory/azure_rm.yml --graph
```

# Phase 2 : Configuration & Dockerisation (4h)
Objectif: preparer les noeuds pour le runtime.

## Tache 1 (Role docker_setup)
### 1.1 Fichier `exervices/laboratoire/ansible/roles/docker_setup/tasks/main.yml`
Emplacement: `exervices/laboratoire/ansible/roles/docker_setup/tasks/main.yml`
```yaml
- name: Install dependencies
  apt:
    name:
      - ca-certificates
      - curl
      - gnupg
      - lsb-release
    state: present
    update_cache: yes

- name: Add Docker GPG key
  apt_key:
    url: https://download.docker.com/linux/ubuntu/gpg
    state: present

- name: Add Docker repo
  apt_repository:
    repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable"
    state: present

- name: Install Docker
  apt:
    name:
      - docker-ce
      - docker-ce-cli
      - containerd.io
      - docker-buildx-plugin
      - docker-compose-plugin
    state: present
    update_cache: yes

- name: Ensure docker service running
  service:
    name: docker
    state: started
    enabled: yes

- name: Add users to docker group
  user:
    name: "{{ item }}"
    groups: docker
    append: yes
  loop: "{{ docker_users }}"
```

## Tache 2 (Securite)
### 2.1 Fichier `exervices/laboratoire/ansible/roles/hardening/tasks/main.yml`
Emplacement: `exervices/laboratoire/ansible/roles/hardening/tasks/main.yml`
```yaml
- name: Install fail2ban
  apt:
    name: fail2ban
    state: present
    update_cache: yes

- name: Disable root SSH login
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^PermitRootLogin'
    line: 'PermitRootLogin no'
  notify: Restart SSH

- name: Disable password auth
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^PasswordAuthentication'
    line: 'PasswordAuthentication no'
  notify: Restart SSH

- name: Ensure fail2ban is running
  service:
    name: fail2ban
    state: started
    enabled: yes
```

### 2.2 Handler `exervices/laboratoire/ansible/roles/hardening/handlers/main.yml`
Emplacement: `exervices/laboratoire/ansible/roles/hardening/handlers/main.yml`
```yaml
- name: Restart SSH
  service:
    name: ssh
    state: restarted
```

## Tache 3 (Registre prive ACR)
### 3.1 Creation du registre
```bash
az acr create -g rg-lab-devops -n <ACR_NAME> --sku Basic
az acr login -n <ACR_NAME>
```

### 3.2 Variables globales et Vault
#### Fichier `exervices/laboratoire/ansible/group_vars/all.yml`
Emplacement: `exervices/laboratoire/ansible/group_vars/all.yml`
```yaml
# Utilisateur SSH et bastion
ansible_user: azureuser
ansible_ssh_common_args: "-o ProxyCommand='ssh -W %h:%p -q azureuser@<BASTION_PUBLIC_IP>'"

# Utilisateurs autorises a utiliser Docker
docker_users:
  - azureuser

# Dossier et versions applicatives
app_dir: /opt/app
app_version: "v1.0.0"
app_version_prev: "v0.9.0"

# Registry privee
registry_url: "<ACR_LOGIN_SERVER>"
registry_username: "<ACR_USERNAME>"
registry_password: "<ACR_PASSWORD>"

# Connexion a la base manag�e (Azure SQL ou MySQL selon choix)
sql_host: "<SQL_HOST>"
sql_db: "appdb"
sql_user: "<DB_USER>"
sql_password: "<DB_PASSWORD>"
```

#### Creation du vault
```bash
cd exervices/laboratoire/ansible
ansible-vault create group_vars/vault.yml
```

Emplacement: `exervices/laboratoire/ansible/group_vars/vault.yml`
```yaml
registry_password: "CHANGE_ME"
sql_password: "CHANGE_ME"
```

# Phase 3 : Deploiement Applicatif "Multi-Container" (5h)
Objectif: deployer l'application via Ansible.

## Tache 1 : Deployer une pile (App + Redis + Nginx)
### 1.1 Role `app_deploy`
Emplacement: `exervices/laboratoire/ansible/roles/app_deploy/tasks/main.yml`
```yaml
- name: Create app directory
  file:
    path: "{{ app_dir }}"
    state: directory

- name: Copy nginx config
  copy:
    src: nginx.conf
    dest: "{{ app_dir }}/nginx.conf"

- name: Render docker-compose.yml
  template:
    src: docker-compose.yml.j2
    dest: "{{ app_dir }}/docker-compose.yml"

- name: Login to registry
  community.docker.docker_login:
    registry_url: "{{ registry_url }}"
    username: "{{ registry_username }}"
    password: "{{ registry_password }}"

- name: Deploy stack
  community.docker.docker_compose:
    project_src: "{{ app_dir }}"
```

### 1.2 Playbook principal `exervices/laboratoire/ansible/playbooks/site.yml`
Emplacement: `exervices/laboratoire/ansible/playbooks/site.yml`
```yaml
- name: Configure and deploy app
  hosts: role_docker-host
  become: yes
  vars_files:
    - group_vars/vault.yml
  roles:
    - docker_setup
    - hardening
    - app_deploy
```

Execution:
```bash
cd exervices/laboratoire/ansible
ansible-playbook playbooks/site.yml --ask-vault-pass
```

### 1.3 Build et push des images
```bash
cd exervices/laboratoire/app
docker build -t <ACR_LOGIN_SERVER>/backend:v1.0.0 backend
docker build -t <ACR_LOGIN_SERVER>/front:v1.0.0 front
docker build -t <ACR_LOGIN_SERVER>/manager:v1.0.0 manager
docker build -t <ACR_LOGIN_SERVER>/worker:v1.0.0 worker

docker push <ACR_LOGIN_SERVER>/backend:v1.0.0
docker push <ACR_LOGIN_SERVER>/front:v1.0.0
docker push <ACR_LOGIN_SERVER>/manager:v1.0.0
docker push <ACR_LOGIN_SERVER>/worker:v1.0.0
```

## Tache 2 : Certificats SSL
### 2.1 Ajout des certificats auto-signes via Ansible
Emplacement: `exervices/laboratoire/ansible/roles/app_deploy/tasks/main.yml` (ajouter ces taches avant la copie Nginx)
```yaml
- name: Install openssl
  apt:
    name: openssl
    state: present
    update_cache: yes

- name: Create SSL directory
  file:
    path: "{{ app_dir }}/ssl"
    state: directory

- name: Generate self-signed certificate (if missing)
  command: >
    openssl req -x509 -nodes -newkey rsa:2048
    -keyout {{ app_dir }}/ssl/nginx.key
    -out {{ app_dir }}/ssl/nginx.crt
    -days 365
    -subj "/CN={{ inventory_hostname }}"
  args:
    creates: "{{ app_dir }}/ssl/nginx.crt"
```

### 2.2 Mise a jour du compose
Emplacement: `exervices/laboratoire/ansible/roles/app_deploy/templates/docker-compose.yml.j2`
```yaml
  nginx:
    image: nginx:alpine
    volumes:
      - "./nginx.conf:/etc/nginx/conf.d/default.conf:ro"
      - "./ssl:/etc/nginx/ssl:ro"
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - front
      - backend
```

### 2.3 Mise a jour de Nginx
Emplacement: `exervices/laboratoire/ansible/roles/app_deploy/files/nginx.conf`
```nginx
server {
  listen 80;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  ssl_certificate /etc/nginx/ssl/nginx.crt;
  ssl_certificate_key /etc/nginx/ssl/nginx.key;

  location / {
    proxy_pass http://front:80;
  }

  location /api/ {
    proxy_pass http://backend:3000/;
  }
}
```

## Tache 3 : Jinja2 pour docker-compose.yml
### 3.1 Template `exervices/laboratoire/ansible/roles/app_deploy/templates/docker-compose.yml.j2`
Emplacement: `exervices/laboratoire/ansible/roles/app_deploy/templates/docker-compose.yml.j2`
```yaml
version: "3.8"
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped

  backend:
    image: "{{ registry_url }}/backend:{{ app_version }}"
    environment:
      DB_HOST: "{{ sql_host }}"
      DB_NAME: "{{ sql_db }}"
      DB_USER: "{{ sql_user }}"
      DB_PASSWORD: "{{ sql_password }}"
    ports:
      - "3000:3000"
    depends_on:
      - redis

  manager:
    image: "{{ registry_url }}/manager:{{ app_version }}"
    depends_on:
      - backend

  worker:
    image: "{{ registry_url }}/worker:{{ app_version }}"
    depends_on:
      - backend

  front:
    image: "{{ registry_url }}/front:{{ app_version }}"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    volumes:
      - "./nginx.conf:/etc/nginx/conf.d/default.conf:ro"
      - "./ssl:/etc/nginx/ssl:ro"
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - front
      - backend
```

# Phase 4 : Maintenance & CI/CD (2h)
Objectif: automatiser le Day 2.

## Tache 1 : Playbook de rollback
### 1.1 Fichier `exervices/laboratoire/ansible/playbooks/rollback.yml`
Emplacement: `exervices/laboratoire/ansible/playbooks/rollback.yml`
```yaml
- name: Rollback to previous version
  hosts: role_docker-host
  become: yes
  vars_files:
    - group_vars/vault.yml
  tasks:
    - name: Render docker-compose with previous version
      template:
        src: roles/app_deploy/templates/docker-compose.yml.j2
        dest: "{{ app_dir }}/docker-compose.yml"
      vars:
        app_version: "{{ app_version_prev }}"

    - name: Redeploy stack
      community.docker.docker_compose:
        project_src: "{{ app_dir }}"
```

Execution:
```bash
ansible-playbook playbooks/rollback.yml --ask-vault-pass
```

## Tache 2 : Healthcheck
### 2.1 Fichier `exervices/laboratoire/ansible/playbooks/healthcheck.yml`
Emplacement: `exervices/laboratoire/ansible/playbooks/healthcheck.yml`
```yaml
- name: Healthcheck
  hosts: role_docker-host
  become: yes
  tasks:
    - name: Check HTTP 200
      uri:
        url: "http://localhost/"
        status_code: 200
```

Execution:
```bash
ansible-playbook playbooks/healthcheck.yml
```

## Critere de reussite (lab)
1. `ansible-inventory --graph` affiche les h�tes Azure dynamiquement.
2. Les VMs Docker sont configurees et l'application tourne.
3. Nginx repond en HTTPS (certificat auto-signe ou Let�s Encrypt).
4. Le rollback et le healthcheck fonctionnent.
