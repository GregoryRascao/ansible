# Broker module

## Initialisation du module dans les modules le requérant

```ts
BrokerModule.register({
    uri: 'messages-broker.memoco.eu',
    username: 'admin',
    password: 'mhsPXOdNXin8s5e0UtJt',
})
```

## Initialisation des queues et des exchanges

```ts
export class LoggerModule implements OnModuleInit {
    constructor(private $broker: BrokerService) {
    }

    onModuleInit(): any {
        Logger.log('Init Logger', LoggerModule.name);
        setTimeout(async () => {
            await this.$broker.createExchange('loggers', 'topic');
            await this.$broker.createQueue('loggers', 'etl', 'etl');
        }, 200);
    }
}
```

!!! Si l'exchange et/ou la queue n'existe pas, le module les créés !!!
