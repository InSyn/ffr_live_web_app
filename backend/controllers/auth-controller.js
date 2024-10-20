import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";

const JWT_SECRET = process.env.JWTS;

export const register = async (req, res) => {
  const { username, password, role } = req.body;

  if (role === "admin") {
    const adminPassword = process.env.AUTH,
      authHeader = req.headers["adminpwd"];

    if (authHeader !== adminPassword) {
      res.status(403).send({ message: "Нет прав для создания администратора" });
      return;
    }
  }

  try {
    const hashedPwd = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPwd, role });

    await user.save();
    res.status(201).send({ message: "Регистрация прошла успешно" });
  } catch (err) {
    res.status(400).send({ message: "Ошибка регистрации" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .send({ message: "Пользователь с таким именем не найден" });
    }

    const validPwd = await bcrypt.compare(password, user.password);
    if (!validPwd) {
      return res.status(400).send({ message: "Неверный пароль" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
    res.status(200).send({ token, role: user.role });
  } catch (err) {
    res.status(400).send({ message: "Неверное имя пользователя или пароль" });
  }
};
