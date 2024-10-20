import { Event } from "../models/event-model.js";
import * as crypto from "crypto";
import { getSeason } from "../utils/formatters.js";
import { flushDocuments, removeOldFile } from "../file-storage/fileStorage.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  createEntityDocuments,
  extractDocumentFiles,
  parseDocuments,
  updateDocuments,
} from "../middleware/documentsHandlers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}, { competitions: 0 }).sort({
      start_at: -1,
    });
    res.status(200).json({
      status: "success",
      events,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Ошибка загрузки событий",
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
      query.location = new RegExp(req.query.location, "i");
    }

    if (req.query.calendar_code) {
      query.calendar_code = req.query.calendar_code;
    }

    const events = await Event.find(query).sort({ start_at: -1 });
    res.status(200).json({
      status: "success",
      results: events.length,
      events,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to search events",
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
    const endDate =
      month === 11
        ? new Date(year + 1, 0, 0, 23, 59, 59, 999)
        : new Date(year, month + 1, 0, 23, 59, 59, 999);

    const events = await Event.find({
      start_at: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({
      start_at: -1,
    });

    res.status(200).json({
      status: "success",
      events,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "События не найдены",
      err: e,
    });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ event_id: req.params.id });
    res.status(200).json({
      status: "success",
      event,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Событие не найдено",
      err: e,
    });
  }
};

export const addNewEvent = async (req, res) => {
  try {
    const logoImage = req.files["logo_image_url"]
      ? `/uploads/images/${req.files["logo_image_url"][0].filename}`
      : "";
    const trackImage = req.files["track_image_url"]
      ? `/uploads/images/${req.files["track_image_url"][0].filename}`
      : "";
    const organizationLogo = req.files["organization_logo"]
      ? `/uploads/images/${req.files["organization_logo"][0].filename}`
      : "";

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
      season: req.body.start_at ? getSeason(req.body.start_at) : "",
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
      status: "success",
      event,
    });
  } catch (e) {
    console.log("ADD ERR", e);
    res.status(404).json({
      status: "Err",
      data: "Ошибка, событие не было добавлено",
      err: e,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ event_id: req.params.id });
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Событие с указанным id не найдено",
      });
    }

    const originalLogoImage = event.logo_image_url;
    const originalTrackImage = event.track_image_url;
    const originalOrganizationLogo = event.organization_logo;

    const logoImage = req.files["logo_image_url"]
      ? `/uploads/images/${req.files["logo_image_url"][0].filename}`
      : event.logo_image_url;
    const trackImage = req.files["track_image_url"]
      ? `/uploads/images/${req.files["track_image_url"][0].filename}`
      : event.track_image_url;
    const organizationLogo = req.files["organization_logo"]
      ? `/uploads/images/${req.files["organization_logo"][0].filename}`
      : event.organization_logo;

    const documentFiles = extractDocumentFiles(req.files);

    const documents = req.body.documents
      ? JSON.parse(req.body.documents)
      : event.documents;

    const updatedDocuments = await updateDocuments(documents, documentFiles);

    event.logo_image_url = logoImage;
    event.track_image_url = trackImage;

    event.calendar_code = req.body.calendar_code || event.calendar_code;
    event.title = req.body.title || event.title;
    event.start_at = req.body.start_at || event.start_at;
    event.season = req.body.start_at
      ? getSeason(req.body.start_at)
      : event.season;
    event.sport = req.body.sport || event.sport;
    event.discipline = req.body.discipline || event.discipline;
    event.country = req.body.country || event.country;
    event.region = req.body.region || event.region;
    event.location = req.body.location || event.location;
    event.organization = req.body.organization || event.organization;
    event.organization_logo = organizationLogo;
    event.timing_provider = req.body.timing_provider || event.timing_provider;
    event.translation_url = req.body.translation_url || event.translation_url;

    event.international =
      req.body.international !== undefined
        ? req.body.international
        : event.international;

    event.documents = updatedDocuments;

    await event.save();

    if (logoImage !== originalLogoImage && originalLogoImage) {
      await removeOldFile(join(__dirname, "..", originalLogoImage));
    }
    if (trackImage !== originalTrackImage && originalTrackImage) {
      await removeOldFile(join(__dirname, "..", originalTrackImage));
    }
    if (
      organizationLogo !== originalOrganizationLogo &&
      originalOrganizationLogo
    ) {
      await removeOldFile(join(__dirname, "..", originalOrganizationLogo));
    }

    res.status(200).json({
      status: "success",
      event,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: `Не удалось обновить данные события: ${e.message}`,
      err: e,
    });
  }
};

export const updateEventResults = async (req, res) => {
  try {
    await Event.updateOne(
      { event_id: req.body.event_id },
      {
        competitions: req.body.competitions ? req.body.competitions : [],
        jury: req.body.jury ? req.body.jury : [],
        forerunners: req.body.forerunners ? req.body.forerunners : [],
        track_info: req.body.track_info ? req.body.track_info : [],
        conditions: req.body.conditions ? req.body.conditions : [],
      }
    );

    res.status(200).json({
      status: "success",
      data: `Данные события ID-${req.params.id} обновлены`,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
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
        status: "error",
        message: "Событие с указанным id не найдено",
      });
    }

    await flushDocuments(event);

    res.status(200).json({
      status: "success",
      data: "Событие было успешно удалено",
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Не удалось удалить событие",
      err: e,
    });
  }
};
