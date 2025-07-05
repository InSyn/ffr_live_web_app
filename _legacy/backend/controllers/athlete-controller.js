import { Athlete } from '../models/athlete-model.js';
import { Event } from '../models/event-model.js';
import { formatLastname } from '../utils/formatters.js';
import { deleteFileIfExists, extractFilesByPrefix, parseJsonFields } from '../utils/filesUtils.js';

const getLastAthleteCode = async () => {
  const lastAthlete = await Athlete.findOne().sort({ _id: -1 });
  const lastIndex = lastAthlete ? lastAthlete.ffr_id : null;

  return (Number(lastIndex) + 1).toString().padStart(4, '0') || '0001';
};

export const getAllAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.find().sort({ lastname: 1, name: 1 });
    res.status(200).json({
      status: 'success',
      athletes,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'Спортсмены не найдены',
      err: e,
    });
  }
};

export const searchAthletes = async (req, res) => {
  try {
    const query = {};
    if (req.query.ffr_id) {
      query.ffr_id = req.query.ffr_id;
    }
    if (req.query.name) {
      const [lastname, name] = req.query.name.split(' ');
      if (lastname) query.lastname = new RegExp(lastname, 'i');
      if (name) query.name = new RegExp(name, 'i');
    }
    if (req.query.gender) {
      query.gender = req.query.gender;
    }
    if (req.query.year) {
      const year = parseInt(req.query.year, 10);
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

      query.birth_date = {
        $gte: startOfYear,
        $lte: endOfYear,
      };
    }
    if (req.query.country) {
      query.country = new RegExp(req.query.country, 'i');
    }
    if (req.query.region) {
      query.regions = new RegExp(req.query.region, 'i');
    }
    if (req.query.sport) {
      query.sport = req.query.sport;
    }
    if (req.query.discipline) {
      query.disciplines = new RegExp(req.query.discipline, 'i');
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const athletes = await Athlete.find(query).sort({ lastname: 1, name: 1 });

    res.status(200).json({
      status: 'success',
      results: athletes.length,
      athletes,
    });
  } catch (error) {
    console.error('Ошибка во время поиска:', error);
    res.status(500).json({
      status: 'Err',
      message: `Ошибка во время поиска: ${error.message}`,
      error: error.message,
    });
  }
};

export const addNewAthlete = async (req, res) => {
  try {
    const photoUrl = req.files['photo_url'] ? `/uploads/images/${req.files['photo_url'][0].filename}` : '';
    const photoTvUrl = req.files['photo_tv_url'] ? `/uploads/images/${req.files['photo_tv_url'][0].filename}` : '';
    const sponsorsFiles = extractFilesByPrefix(req.files, 'sponsor');

    const parsedFields = parseJsonFields(req.body, ['regions', 'organizations', 'disciplines', 'trainer', 'equipment', 'hobbies', 'medals', 'socials']);

    const athlete = new Athlete({
      ffr_id: req.body.ffr_id ? req.body.ffr_id : await getLastAthleteCode(),
      name: req.body.name,
      lastname: formatLastname(req.body.lastname),
      gender: req.body.gender,
      birth_date: req.body.birth_date,
      photo_url: photoUrl,
      photo_tv_url: photoTvUrl,
      country: req.body.country,
      sport: req.body.sport,
      category: req.body.category,
      is_national_team: req.body.is_national_team,
      education: req.body.education,
      athleteAbout: req.body.athleteAbout,
      sponsors: req.body.sponsors
        ? JSON.parse(req.body.sponsors).map((sponsor, idx) => ({
            ...sponsor,
            logo_url: sponsorsFiles[`sponsor${idx}_logo`] || '',
          }))
        : [],
      ...parsedFields,
    });

    await athlete.save();

    res.status(200).json({
      status: 'success',
      athlete,
    });
  } catch (e) {
    console.error('ADD ERR', e);
    res.status(500).json({
      status: 'Err',
      message: `Не удалось добавить спортсмена: ${e.message}`,
      err: e,
    });
  }
};

export const updateAthlete = async (req, res) => {
  const athleteId = req.params.code;

  try {
    const athlete = await Athlete.findOne({ ffr_id: athleteId });
    if (!athlete) {
      return res.status(404).json({
        status: 'Err',
        message: 'Спортсмен с таким кодом не найден',
      });
    }

    const originalPhotoUrl = athlete.photo_url;
    const originalPhotoTvUrl = athlete.photo_tv_url;
    const originalSponsorLogos = athlete.sponsors.map((sponsor) => sponsor.logo_url);

    const photoUrl = req.files['photo_url'] ? `/uploads/images/${req.files['photo_url'][0].filename}` : athlete.photo_url;
    const photoTvUrl = req.files['photo_tv_url'] ? `/uploads/images/${req.files['photo_tv_url'][0].filename}` : athlete.photo_tv_url;
    const sponsorsFiles = extractFilesByPrefix(req.files, 'sponsor');

    const parsedFields = parseJsonFields(req.body, ['regions', 'organizations', 'disciplines', 'trainer', 'equipment', 'hobbies', 'medals', 'socials']);

    const updatedSponsors = req.body.sponsors
      ? JSON.parse(req.body.sponsors).map((sponsor, idx) => ({
          ...sponsor,
          logo_url: sponsorsFiles[`sponsor${idx}_logo`] || sponsor.logo_url,
        }))
      : athlete.sponsors;

    athlete.set({
      ffr_id: req.body.ffr_id || athlete.ffr_id,
      name: req.body.name || athlete.name,
      lastname: formatLastname(req.body.lastname) || athlete.lastname,
      gender: req.body.gender || athlete.gender,
      birth_date: req.body.birth_date || athlete.birth_date,
      country: req.body.country || athlete.country,
      sport: req.body.sport || athlete.sport,
      category: req.body.category || athlete.category,
      photo_url: photoUrl,
      photo_tv_url: photoTvUrl,
      sponsors: updatedSponsors,
      is_national_team: req.body.is_national_team !== undefined ? req.body.is_national_team : athlete.is_national_team,
      education: req.body.education || athlete.education,
      athleteAbout: req.body.athleteAbout || athlete.athleteAbout,
      ...parsedFields,
    });

    await athlete.save();

    if (photoUrl !== originalPhotoUrl && originalPhotoUrl) {
      await deleteFileIfExists(originalPhotoUrl);
    }
    if (photoTvUrl !== originalPhotoTvUrl && originalPhotoTvUrl) {
      await deleteFileIfExists(originalPhotoTvUrl);
    }

    await Promise.all(
      originalSponsorLogos.map(async (logo, idx) => {
        const newLogo = updatedSponsors[idx]?.logo_url;
        if (newLogo && logo !== newLogo) {
          await deleteFileIfExists(logo);
        }
      })
    );

    res.status(200).json({
      status: 'success',
      data: athlete,
    });
  } catch (e) {
    console.error('UPDATE ERR', e);
    res.status(500).json({
      status: 'Err',
      message: `Не удалось обновить данные спортсмена: ${e.message}`,
      err: e.message,
    });
  }
};

export const getAthlete = async (req, res) => {
  try {
    const athlete = await Athlete.findOne({ ffr_id: req.params.code });

    res.status(200).json({
      status: 'success',
      data: athlete,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'Athlete not found',
      err: e,
    });
  }
};

export const getAthleteCompetitions = async (req, res) => {
  try {
    const events = await Event.find(
      {
        'competitions.competitors.ffr_id': req.params.code,
      },
      {
        created_at: 0,
        description: 0,
        organization: 0,
        timing_provider: 0,
        'competitions.races': 0,
      }
    ).sort({ start_at: -1 });

    res.status(200).json({
      status: 'success',
      events,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'События не найдены',
      err: e,
    });
  }
};

export const getAthleteTvPhotoUrl = async (req, res) => {
  try {
    const athlete = await Athlete.findOne({ ffr_id: req.params.code });

    if (!athlete || !athlete.photo_tv_url) {
      return res.status(404).json({
        status: 'Err',
        message: 'Фото TV не найдено',
      });
    }

    const fullUrl = `${req.protocol}://${req.get('host')}${athlete.photo_tv_url}`;
    res.status(200).json({
      status: 'success',
      photo_tv_url: fullUrl,
    });
  } catch (e) {
    console.error('GET TV PHOTO URL ERR', e);
    res.status(500).json({
      status: 'Err',
      message: 'Не удалось получить URL фото TV',
      err: e.message,
    });
  }
};

export const deleteAthlete = async (req, res) => {
  const athleteId = req.params.code;

  try {
    const athlete = await Athlete.findOneAndDelete({
      ffr_id: athleteId,
    });

    if (!athlete) {
      return res.status(404).json({
        status: 'Err',
        message: 'Спортсмен с таким кодом не найден',
      });
    }

    const filesToDelete = [athlete['photo_url'], athlete['photo_tv_url'], ...athlete['sponsors'].map((sponsor) => sponsor.logo_url)];

    await Promise.all(filesToDelete.map((filePath) => filePath && deleteFileIfExists(filePath)));

    res.status(200).json({
      status: 'success',
      data: 'Спортсмен был успешно удален',
    });
  } catch (e) {
    console.error('DELETE ERR', e);
    res.status(500).json({
      status: 'Err',
      message: `Не удалось удалить спортсмена: ${e.message}`,
      err: e.message,
    });
  }
};
