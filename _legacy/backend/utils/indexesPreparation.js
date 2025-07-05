import { Athlete } from '../models/athlete-model.js';
import { Event } from '../models/event-model.js';
import { Jury } from '../models/jury-model.js';
import { Organization } from '../models/organization-model.js';
import { Seminar } from '../models/seminar-model.js';
import { Trainer } from '../models/trainer-model.js';

export const syncIndexes = async () => {
  await Athlete.syncIndexes();
  await Event.syncIndexes();
  await Jury.syncIndexes();
  await Organization.syncIndexes();
  await Seminar.syncIndexes();
  await Trainer.syncIndexes();
};
