const jsonServer = require('json-server');
const auth = require('json-server-auth');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs')

const readDatabase = () => {
  const dbPath = path.resolve(__dirname, 'db.json');
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture de db.json:', error);
    return { users: [] };
  }
};
const generateAccessToken = (payload, secret, options) => {
  return jwt.sign(payload, secret, options);
};
const generateRefreshToken = (payload, secret, options) => {
  return jwt.sign(payload, secret, options);
};

const refreshTokenMiddleware = (req, res, next) => {
  if (req.method === 'POST' && req.url === '/refresh-token') {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token manquant.' });
    }

    try {
      const decoded = jwt.verify(refreshToken, 'H2eulqW8mGDlthNWycx1eqtk1MhGpe12mklSaVkk');
      const db = readDatabase();
      const user = db.users.find(u => u.id === decoded.userId);

      if (!user) {
        return res.status(401).json({ message: 'Refresh token invalide.' });
      }

      const accessTokenPayload = { sub: user.id, username: user.username, roles: user.roles };
      const accessTokenSecret = 'sNQVTUT6xxqvZH7YptcAlqJsq7iI5zZQj43405Dc';
      const accessTokenOptions = { expiresIn: '15m' };

      const newAccessToken = generateAccessToken(accessTokenPayload, accessTokenSecret, accessTokenOptions);

      delete user.password;
      return res.json({ accessToken: newAccessToken, refreshToken, user });

    } catch (error) {
      return res.status(401).json({ message: 'Refresh token invalide ou expiré.' });
    }
  } else {
    next();
  }
};

const jsonServerCustom = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

jsonServerCustom.db = router.db;

jsonServerCustom.use(middlewares);
jsonServerCustom.use(jsonServer.bodyParser);
jsonServerCustom.use(refreshTokenMiddleware); // Utilise le middleware pour /refresh-token

// Middleware personnalisé pour modifier la réponse de /login
jsonServerCustom.use((req, res, next) => {
  if (req.method === 'POST' && req.url === '/login') {
    const db = readDatabase();
    const user = db.users.find(user => user.email === req.body.email);

    if (!user) {
      res.status(401).json({ message: 'Identifiants invalides.' });
    }
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      res.status(401).json({ message: 'Identifiants invalides.' });
    }

    const refreshTokenPayload = { userId: user.id };
    const refreshTokenSecret = 'H2eulqW8mGDlthNWycx1eqtk1MhGpe12mklSaVkk';
    const refreshTokenOptions = { expiresIn: '7d' };
    const refreshToken = generateRefreshToken(refreshTokenPayload, refreshTokenSecret, refreshTokenOptions);

    const accessTokenPayload = { sub: user.id, username: user.username, roles: user.roles };
    const accessTokenSecret = 'sNQVTUT6xxqvZH7YptcAlqJsq7iI5zZQj43405Dc';
    const accessTokenOptions = { expiresIn: '15m' };
    const accessToken = generateAccessToken(accessTokenPayload, accessTokenSecret, accessTokenOptions);

    delete user.password;
    res.json({ accessToken, refreshToken, user });
  } else {
    next();
  }
});

jsonServerCustom.use(auth);
jsonServerCustom.use(router);

jsonServerCustom.listen(3000, () => {
  console.log('JSON Server avec gestion de refresh token sur /login et /refresh-token');
});
