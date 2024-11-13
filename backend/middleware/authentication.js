import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWTS;

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.role !== 'admin') return res.status(403).send({ message: 'Недостаточно прав для совершения операции' });

  next();
};

export const isSecretary = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.role !== 'secretary' && decoded.role !== 'admin') return res.status(403).send({ message: 'Недостаточно прав для совершения операции' });

  next();
};
