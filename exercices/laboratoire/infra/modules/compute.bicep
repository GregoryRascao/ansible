param location string
param prefix string
param adminUsername string
@secure()
param adminPassword string
param sshPublicKey string
param publicSubnetId string
param privateSubnetId string

var vmSize = 'Standard_B2ls_v2'
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
