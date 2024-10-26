import { Seminar } from '../models/seminar-model.js';
import { createEntityDocuments, extractDocumentFiles, parseDocuments, updateDocuments } from '../middleware/documentsHandlers.js';
import { flushDocuments } from '../file-storage/fileStorage.js';
import { getSeason } from '../utils/formatters.js';
import { Event } from '../models/event-model.js';

export const getSeminars = async (req, res) => {
  try {
    const seminars = await Seminar.find().sort({ date: -1 });
    res.status(200).json({
      status: 'success',
      seminars,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      data: 'Competitors not found ',
      err: e,
    });
  }
};

export const searchSeminars = async (req, res) => {
  try {
    const query = {};

    if (req.query.sport) {
      query.sport = req.query.sport;
    }
    if (req.query.discipline) {
      query.disciplines = req.query.discipline;
    }
    if (req.query.season) {
      query.season = req.query.season;
    }
    if (req.query.region) {
      query.region = new RegExp(req.query.region, 'i');
    }
    if (req.query.location) {
      query.$text = { $search: req.query.location };
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

    const seminars = await Seminar.find(query).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      results: seminars.length,
      seminars,
    });
  } catch (error) {
    console.error('Ошибка во время поиска:', error);
    res.status(500).json({
      status: 'error',
      message: `Ошибка во время поиска: ${error.message}`,
      error: error.message,
    });
  }
};

export const getSeminarsByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = month === 11 ? new Date(year + 1, 0, 0, 23, 59, 59, 999) : new Date(year, month + 1, 0, 23, 59, 59, 999);

    const seminars = await Seminar.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({
      start_at: -1,
    });

    res.status(200).json({
      status: 'success',
      seminars,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      data: 'Семинары не найдены',
      err: e,
    });
  }
};

export const createSeminar = async (req, res) => {
  try {
    const { title, sport, disciplines, format, country, region, location, date, contacts } = req.body;

    const documents = parseDocuments(req.body);
    const documentFiles = extractDocumentFiles(req.files);
    const seminarDocuments = createEntityDocuments(documents, documentFiles);

    const seminar = new Seminar({
      title,
      sport,
      disciplines: disciplines ? JSON.parse(disciplines) : [],
      format,
      country,
      region,
      location,
      date: new Date(date),
      season: date ? getSeason(date) : '',
      documents: seminarDocuments,
      contacts: contacts ? JSON.parse(contacts) : [],
    });

    await seminar.save();

    res.status(201).json({
      status: 'success',
      seminar,
    });
  } catch (error) {
    console.error('Не удалось создать семинар:', error);
    res.status(500).json({
      status: 'error',
      message: `Не удалось создать семинар: ${error.message}`,
      error: error.message,
    });
  }
};

export const getSeminar = async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      seminar,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      data: 'Семинар не найден',
      err: e,
    });
  }
};

export const updateSeminar = async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id);
    if (!seminar) {
      return res.status(404).json({
        status: 'error',
        message: 'Семинар с указанным id не найден',
      });
    }

    const documentFiles = extractDocumentFiles(req.files);

    const documents = req.body.documents ? JSON.parse(req.body.documents) : seminar.documents;

    const updatedDocuments = await updateDocuments(documents, documentFiles);

    seminar.documents = updatedDocuments;

    seminar.title = req.body.title || seminar.title;
    seminar.sport = req.body.sport || seminar.sport;
    seminar.disciplines = req.body.disciplines ? JSON.parse(req.body.disciplines) : seminar.disciplines;
    seminar.format = req.body.format || seminar.format;
    seminar.country = req.body.country || seminar.country;
    seminar.region = req.body.region || seminar.region;
    seminar.location = req.body.location || seminar.location;
    seminar.date = req.body.date ? new Date(req.body.date) : seminar.date;
    seminar.season = req.body.date ? getSeason(req.body.date) : seminar.season;
    seminar.contacts = req.body.contacts ? JSON.parse(req.body.contacts) : seminar.contacts;

    await seminar.save();

    res.status(200).json({
      status: 'success',
      data: seminar,
    });
  } catch (error) {
    console.error('Error updating seminar:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить данные семинара',
      error: error.message,
    });
  }
};

export const updateSeminarParticipants = async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id);
    if (!seminar) {
      return res.status(404).json({
        status: 'error',
        message: 'Семинар с указанным id не найден',
      });
    }

    const participants = req.body.participants ? JSON.parse(req.body.participants) : [];
    seminar.participants = participants;

    await seminar.save();

    res.status(200).json({
      status: 'success',
      seminar,
    });
  } catch (error) {
    console.error('Error updating seminar participants:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось обновить участников семинара',
      error: error.message,
    });
  }
};

export const deleteSeminar = async (req, res) => {
  try {
    const seminar = await Seminar.findById(req.params.id);

    if (!seminar) {
      return res.status(404).json({
        status: 'error',
        message: 'Семинар с указанным id не найден',
      });
    }

    await flushDocuments(seminar);

    res.status(204).json({
      status: 'success',
      data: 'Семинар был успешно удален',
    });
  } catch (error) {
    console.error('Error deleting seminar:', error);
    res.status(500).json({
      status: 'error',
      message: 'Не удалось удалить семинар',
      error: error.message,
    });
  }
};
