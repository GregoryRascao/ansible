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

output vnetId string = vnet.id
output publicSubnetId string = vnet.properties.subnets[0].id
output privateSubnetId string = vnet.properties.subnets[1].id
