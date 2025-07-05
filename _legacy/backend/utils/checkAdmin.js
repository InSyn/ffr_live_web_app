import { User } from '../models/user-model.js';
import bcrypt from 'bcryptjs';

export const checkAdminPresence = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) return;

    console.log('Starting admin creation...');
    const hashedPwd = await bcrypt.hash(process.env.SERVICE_ADMIN_PASSWORD, 10);
    const user = new User({
      username: process.env.SERVICE_ADMIN_LOGIN,
      password: hashedPwd,
      role: 'admin',
    });
    await user.save();
    console.log('Admin was added successfully');
  } catch (e) {
    console.log(`Admin add error: ${e}`);
  }
};
