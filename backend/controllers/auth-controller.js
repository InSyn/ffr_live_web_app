import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user-model.js';

const JWT_SECRET = process.env.JWTS;

export const register = async (req, res) => {
  const { username, email, password, role, region } = req.body;

  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded.role !== 'admin' && decoded.role !== 'secretary') {
    return res.status(403).send({ message: 'Нет прав для создания администратора' });
  }
  if (role === 'regional_organization' && !region) {
    return res.status(403).send({ message: 'Для создания аккаунта организации необходимо указать регион' });
  }

  try {
    const hashedPwd = await bcrypt.hash(password, 12);

    const userFields = {};

    if (username) userFields.username = username;
    if (email) userFields.email = email;
    if (role) userFields.role = role;
    if (region) userFields.region = region;

    const user = new User({
      ...userFields,
      password: hashedPwd,
    });

    await user.save();
    res.status(201).send({ message: 'Регистрация прошла успешно' });
  } catch (err) {
    res.status(400).send({ message: `Ошибка регистрации: ${err.message}` });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send({ message: 'Пользователь с таким именем не найден' });
    }

    const validPwd = await bcrypt.compare(password, user.password);
    if (!validPwd) {
      return res.status(400).send({ message: 'Неверный пароль' });
    }
    const token = jwt.sign({ role: user.role, region: user.region }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).send({ token, id: user._id, role: user.role, region: user.region });
  } catch (err) {
    res.status(400).send({ message: 'Неверное имя пользователя или пароль' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!roles.includes(decoded.role)) {
      return res.status(403).send({ message: 'Нет прав доступа к этому ресурсу' });
    }

    next();
  };
};
