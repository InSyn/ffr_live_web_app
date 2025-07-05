import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user-model.js';

const JWT_SECRET = process.env.JWTS;
const dbRoles = ['secretary', 'jury', 'athlete', 'trainer'];

export const register = async (req, res) => {
  const { username, email, password, role, region, ffr_id } = req.body;

  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  if (decoded.role !== 'admin' && decoded.role !== 'secretary') {
    return res.status(403).json({ message: 'Нет прав для создания нового пользователя' });
  }
  if (dbRoles.includes(role) && !ffr_id) {
    return res.status(403).json({ message: 'Укажите FFR-ID для создания аккаунта' });
  }
  if (role === 'regional_organization' && !region) {
    return res.status(403).json({ message: 'Для создания аккаунта организации необходимо указать регион' });
  }

  try {
    const hashedPwd = await bcrypt.hash(password, 12);

    const userFields = {};

    if (username) userFields.username = username;
    if (email) userFields.email = email;
    if (role) userFields.role = role;
    if (region) userFields.region = region;
    if (ffr_id) userFields.ffr_id = ffr_id;

    const user = new User({
      ...userFields,
      password: hashedPwd,
    });

    await user.save();
    res.status(201).json({ message: 'Регистрация прошла успешно' });
  } catch (err) {
    res.status(400).json({ message: `Ошибка регистрации: ${err.message}` });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Пользователь с таким именем не найден' });
    }

    const validPwd = await bcrypt.compare(password, user.password);
    if (!validPwd) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    const token = jwt.sign({ id: user._id, role: user.role, region: user.region, ffr_id: user.ffr_id }, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 30 });

    res.status(200).json({ token, role: user.role, region: user.region, ffr_id: user.ffr_id });
  } catch (err) {
    res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
  }
};
