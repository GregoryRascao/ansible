# Utilisation de la securité

1. Ajouter **provideSecurity(options)** au fichier **app.config** avec comme options les éléments suivants

```js
{
  "applicationTitle" ? : string;
  "useC8y" ? : boolean;
  "selectC8y" ? : (authState: AuthState) => C8yState;
  "useCookie" ? : boolean;
  "cookieOptions" ? : CookieOptions;
}
```

# Utilisation de la map

1. Ajouter **@import "leaflet/dist/leaflet.css";** au fichier **style.css**
2. Ajouter await **loadMapIcons()** dans le ficher **app.config** dans le provider: **provideEnvironmentInitializer**
