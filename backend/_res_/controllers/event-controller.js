import { Event } from '../models/event-model.js';
import * as crypto from 'crypto';
import { getSeason } from '../utils/formatters.js';
import { flushDocuments, removeOldFile } from '../file-storage/fileStorage.js';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createEntityDocuments, extractDocumentFiles, parseDocuments, updateDocuments } from '../middleware/documentsHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    res.status(404).json({
      status: 'Err',
      data: 'Ошибка загрузки событий',
      err: e,
    });
  }
};

export const searchEvents = async (req, res) => {
  try {
    const query = {};

    if (req.query.title) {
      query.$text = { $search: req.query.title };
    }
    if (req.query.sport) {
      query.sport = req.query.sport;
    }
    if (req.query.discipline) {
      query.discipline = req.query.discipline;
    }
    if (req.query.season) {
      query.season = req.query.season;
    }
    if (req.query.date) {
      const startOfDay = new Date(req.query.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(req.query.date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.start_at = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }
    if (req.query.location) {
      query.location = new RegExp(req.query.location, 'i');
    }

    if (req.query.calendar_code) {
      query.calendar_code = req.query.calendar_code;
    }

    const events = await Event.find(query).sort({ start_at: -1 });
    res.status(200).json({
      status: 'success',
      results: events.length,
      events,
    });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search events',
      error: error.message,
    });
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
      data: 'События не найдены',
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
      data: 'Событие не найдено',
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

    const event = new Event({
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
    });

    await event.save();

    res.status(200).json({
      status: 'success',
      event,
    });
  } catch (e) {
    console.log('ADD ERR', e);
    res.status(500).json({
      status: 'Err',
      data: `Ошибка, событие не было добавлено: ${e.message}`,
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

    const updateFields = {};

    const originalLogoImage = event.logo_image_url;
    const originalTrackImage = event.track_image_url;
    const originalOrganizationLogo = event.organization_logo;

    if (req.files['logo_image_url']) {
      updateFields.logo_image_url = `/uploads/images/${req.files['logo_image_url'][0].filename}`;
    }
    if (req.files['track_image_url']) {
      updateFields.track_image_url = `/uploads/images/${req.files['track_image_url'][0].filename}`;
    }
    if (req.files['organization_logo']) {
      updateFields.organization_logo = `/uploads/images/${req.files['organization_logo'][0].filename}`;
    }
    const documentFiles = extractDocumentFiles(req.files);
    const documents = req.body.documents ? JSON.parse(req.body.documents) : event.documents;
    const updatedDocuments = await updateDocuments(documents, documentFiles);
    updateFields.documents = updatedDocuments;

    Object.assign(updateFields, {
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

    await Event.updateOne({ event_id: req.params.id }, { $set: updateFields });

    if (updateFields.logo_image_url !== originalLogoImage && originalLogoImage) {
      await removeOldFile(resolve(__dirname, '..', originalLogoImage));
    }
    if (updateFields.track_image_url !== originalTrackImage && originalTrackImage) {
      await removeOldFile(resolve(__dirname, '..', originalTrackImage));
    }
    if (updateFields.organization_logo !== originalOrganizationLogo && originalOrganizationLogo) {
      await removeOldFile(resolve(__dirname, '..', originalOrganizationLogo));
    }

    res.status(200).json({
      status: 'success',
      event,
    });
  } catch (e) {
    res.status(500).json({
      status: 'Err',
      data: `Не удалось обновить данные события: ${e.message}`,
      err: e,
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
      data: `Не удалось обновить данные события. ${e.message}`,
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

    await flushDocuments(event);

    res.status(200).json({
      status: 'success',
      data: 'Событие было успешно удалено',
    });
  } catch (e) {
    res.status(500).json({
      status: 'Err',
      data: `Не удалось удалить событие: ${e.message}`,
      err: e,
    });
  }
};
