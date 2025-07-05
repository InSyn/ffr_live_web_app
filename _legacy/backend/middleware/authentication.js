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

export const hasRole =
  (...roles) =>
  (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ status: 'Err', message: 'Недостаточно прав для совершения операции' });
      }

      req.user = decoded;
      next();
    } catch (e) {
      console.log(`Ошибка при проверке роли пользователя: ${e}`);
      res.status(500).json({ status: 'Err', message: `Не удалось проверить роль пользователя: ${e}` });
    }
  };

export const isAdmin = hasRole('admin');
export const isSecretary = hasRole('admin', 'secretary');
export const isOrganization = hasRole('admin', 'regional_organization');
export const isTrainer = hasRole('admin', 'trainer');
