import { Event } from '../models/event-model.js';
import { deleteFileIfExists, flushDocuments } from '../utils/filesUtils.js';
import { createEntityDocuments, extractDocumentFiles, parseDocuments, updateDocuments } from '../utils/documentsHandlers.js';
import * as crypto from 'crypto';
import { getSeason } from '../utils/formatters.js';
import { buildDateRangeQuery } from '../utils/dateUtils.js';

const buildEventQuery = (req) => {
  const query = {};

  if (req.query.title) query.$text = { $search: req.query.title };
  if (req.query.sport) query.sport = req.query.sport;
  if (req.query.discipline) query.discipline = req.query.discipline;
  if (req.query.season) query.season = req.query.season;
  if (req.query.date) query.start_at = buildDateRangeQuery(req.query.date);
  if (req.query.location) query.location = new RegExp(req.query.location, 'i');
  if (req.query.calendar_code) query.calendar_code = req.query.calendar_code;

  return query;
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}, { competitions: 0 }).sort({
      start_at: -1,
    });

    res.status(200).json({
      status: 'success',
      events,
    });
  } catch (e) {
    res.status(500).json({
      status: 'Err',
      message: 'Ошибка загрузки событий',
      err: e,
    });
  }
};

export const searchEvents = async (req, res) => {
  try {
    const query = buildEventQuery(req);
    const events = await Event.find(query).sort({ start_at: -1 });

    res.status(200).json({ status: 'success', results: events.length, events });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to search events', error: error.message });
  }
};

export const getEventByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = month === 11 ? new Date(year + 1, 0, 0, 23, 59, 59, 999) : new Date(year, month + 1, 0, 23, 59, 59, 999);

    const events = await Event.find({
      start_at: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({
      start_at: -1,
    });

    res.status(200).json({
      status: 'success',
      events,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'События не найдены',
      err: e,
    });
  }
};

export const getEventsWithRegistration = async (req, res) => {
  try {
    const events = await Event.find({ registration_status: true }, { competitions: 0 }).sort({
      start_at: -1,
    });

    res.status(200).json({
      status: 'success',
      events,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'Ошибка загрузки событий',
      err: e,
    });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ event_id: req.params.id });

    res.status(200).json({
      status: 'success',
      event,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'Событие не найдено',
      err: e,
    });
  }
};

export const addNewEvent = async (req, res) => {
  try {
    const logoImage = req.files['logo_image_url'] ? `/uploads/images/${req.files['logo_image_url'][0].filename}` : '';
    const trackImage = req.files['track_image_url'] ? `/uploads/images/${req.files['track_image_url'][0].filename}` : '';
    const organizationLogo = req.files['organization_logo'] ? `/uploads/images/${req.files['organization_logo'][0].filename}` : '';

    const documents = parseDocuments(req.body);
    const documentFiles = extractDocumentFiles(req.files);
    const eventDocuments = createEntityDocuments(documents, documentFiles);

    const eventObj = {
      is_public: req.body.is_public,
      event_id: req.body.event_id || crypto.randomUUID(),
      created_at: new Date(),
      logo_image_url: logoImage,
      track_image_url: trackImage,
      calendar_code: req.body.calendar_code,
      title: req.body.title,
      international: req.body.international,
      start_at: req.body.start_at,
      season: req.body.start_at ? getSeason(req.body.start_at) : '',
      sport: req.body.sport,
      discipline: req.body.discipline,
      country: req.body.country,
      region: req.body.region,
      location: req.body.location,
      organization: req.body.organization,
      organization_logo: organizationLogo,
      timing_provider: req.body.timing_provider,

      translation_url: req.body.translation_url,
      documents: eventDocuments,
    };

    const event = new Event(eventObj);

    await event.save();

    res.status(200).json({
      status: 'success',
      event,
    });
  } catch (e) {
    console.log('ADD ERR', e);
    res.status(500).json({
      status: 'Err',
      message: `Ошибка, событие не было добавлено: ${e.message}`,
      err: e,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ event_id: req.params.id });
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Событие с указанным id не найдено',
      });
    }

    const originalLogoImage = event.logo_image_url;
    const originalTrackImage = event.track_image_url;
    const originalOrganizationLogo = event.organization_logo;

    const logoImageUrl = req.files['logo_image_url'] ? `/uploads/images/${req.files['logo_image_url'][0].filename}` : event.logo_image_url;
    const trackImageUrl = req.files['track_image_url'] ? `/uploads/images/${req.files['track_image_url'][0].filename}` : event.track_image_url;
    const organizationLogo = req.files['organization_logo'] ? `/uploads/images/${req.files['organization_logo'][0].filename}` : event.organization_logo;

    const documentFiles = extractDocumentFiles(req.files);
    const documents = req.body.documents ? JSON.parse(req.body.documents) : event.documents;
    const updatedDocuments = await updateDocuments(documents, documentFiles);

    event.set({
      logo_image_url: logoImageUrl,
      track_image_url: trackImageUrl,
      organization_logo: organizationLogo,
      documents: updatedDocuments,
      is_public: req.body.is_public ?? event.is_public,
      calendar_code: req.body.calendar_code || event.calendar_code,
      title: req.body.title || event.title,
      start_at: req.body.start_at || event.start_at,
      season: req.body.start_at ? getSeason(req.body.start_at) : event.season,
      sport: req.body.sport || event.sport,
      discipline: req.body.discipline || event.discipline,
      country: req.body.country || event.country,
      region: req.body.region || event.region,
      location: req.body.location || event.location,
      organization: req.body.organization || event.organization,
      timing_provider: req.body.timing_provider || event.timing_provider,
      translation_url: req.body.translation_url || event.translation_url,
      international: req.body.international !== undefined ? req.body.international : event.international,
    });

    await event.save();

    if (logoImageUrl !== originalLogoImage && originalLogoImage) {
      await deleteFileIfExists(originalLogoImage);
    }
    if (trackImageUrl !== originalTrackImage && originalTrackImage) {
      await deleteFileIfExists(originalTrackImage);
    }
    if (organizationLogo !== originalOrganizationLogo && originalOrganizationLogo) {
      await deleteFileIfExists(originalOrganizationLogo);
    }

    res.status(200).json({
      status: 'success',
      event,
    });
  } catch (e) {
    res.status(500).json({
      status: 'Err',
      message: `Не удалось обновить данные события: ${e.message}`,
      err: e,
    });
  }
};

export const updateEventRegistrationSettings = async (req, res) => {
  try {
    const { id: event_id } = req.params;

    const updateFields = {};

    if ('registration_status' in req.body) updateFields.registration_status = req.body.registration_status;
    if ('allow_registration_by_trainer' in req.body) updateFields.allow_registration_by_trainer = req.body.allow_registration_by_trainer;
    if ('allow_registration_by_organization' in req.body) updateFields.allow_registration_by_organization = req.body.allow_registration_by_organization;
    if ('allowed_secretaries' in req.body) updateFields.allowed_secretaries = req.body.allowed_secretaries;
    if ('athletes_groups' in req.body) updateFields.athletes_groups = req.body.athletes_groups;

    const event = await Event.findOneAndUpdate({ event_id }, { $set: updateFields }, { new: true });

    if (!event) {
      return res.status(404).json({
        status: 'Error',
        message: 'Event not found',
      });
    }

    res.status(200).json({
      status: 'success',
      event,
    });
  } catch (e) {
    console.error('Update Event Registration Settings Error', e);
    res.status(500).json({
      status: 'Error',
      message: `Failed to update event registration settings: ${e.message}`,
    });
  }
};

export const updateEventResults = async (req, res) => {
  try {
    const updateFields = {};

    if (req.body.competitions !== undefined) {
      updateFields.competitions = req.body.competitions;
    }
    if (req.body.jury !== undefined) {
      updateFields.jury = req.body.jury;
    }
    if (req.body.forerunners !== undefined) {
      updateFields.forerunners = req.body.forerunners;
    }
    if (req.body.track_info !== undefined) {
      updateFields.track_info = req.body.track_info;
    }
    if (req.body.conditions !== undefined) {
      updateFields.conditions = req.body.conditions;
    }

    await Event.updateOne(
      { event_id: req.body.event_id },
      {
        $set: updateFields,
      }
    );

    res.status(200).json({
      status: 'success',
      data: `Данные события ID-${req.params.id} обновлены`,
    });
  } catch (e) {
    res.status(500).json({
      status: 'Err',
      message: `Не удалось обновить данные события. ${e.message}`,
      err: e,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ event_id: req.params.id });

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Событие с указанным id не найдено',
      });
    }

    const filesToDelete = [event.logo_image_url, event.track_image_url, event.organization_logo];
    await Promise.all(filesToDelete.map((filePath) => filePath && deleteFileIfExists(filePath)));

    await flushDocuments(event);

    await Event.deleteOne({ event_id: req.params.id });

    res.status(200).json({
      status: 'success',
      data: 'Событие было успешно удалено',
    });
  } catch (e) {
    res.status(500).json({
      status: 'Err',
      message: `Не удалось удалить событие: ${e.message}`,
      err: e,
    });
  }
};

// const setDefaultEventAccessSettings = (event) => {
//   return {
//     ...event,
//     registration_status: false,
//     allow_registration_by_trainer: true,
//     allow_registration_by_organization: true,
//     allowed_secretaries: [],
//     athletes_groups: [],
//   };
// };
