import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { OnlineRegistration } from '../models/onlineRegistration-model.js';
import { User } from '../models/user-model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllEventRegistrations = async (req, res) => {
  const event_id = req.params.event_id;

  try {
    const registrations = await OnlineRegistration.find({ event_id: event_id }).populate({
      path: 'athletes.athlete',
      model: 'Athlete',
      select: 'rus_code name lastname gender birth_date country regions sport disciplines category is_national_team trainer',
    });
    res.status(200).json({
      status: 'success',
      registrations,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      data: 'Registrations not found ',
      err: e,
    });
  }
};

export const addRegistration = async (req, res) => {
  const user = await User.findOne({ username: req.body.creator_username });
  if (!user) {
    return res.status(400).send({ message: 'Пользователь с таким именем не найден' });
  }

  try {
    const registration = new OnlineRegistration({
      event_id: req.body.event_id,
      creator_id: user._id,
      creator_role: req.body.creator_role,
      creator_username: req.body.creator_username,
      region: user.region,
      created_at: new Date(),
      athletes: req.body.athletes,
      athletes_groups: req.body.athletes_groups,
      documents: req.body.documents,
    });

    await registration.save();

    res.status(200).json({
      status: 'success',
      registration,
    });
  } catch (e) {
    console.error('ADD ERR', e);
    res.status(404).json({
      status: 'Err',
      message: `Ошибка отправки онлайн заявки: ${e.message}`,
      err: e,
    });
  }
};

export const updateRegistration = async (req, res) => {};

export const deleteRegistration = async (req, res) => {};
