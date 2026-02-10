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
