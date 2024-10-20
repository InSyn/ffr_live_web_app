import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { removeOldFile } from "../file-storage/fileStorage.js";
import { Trainer } from "../models/trainer-model.js";
import { Athlete } from "../models/athlete-model.js";
import { formatFullname } from "../utils/formatters.js";
import { Seminar } from "../models/seminar-model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ fullname: 1 });
    res.status(200).json({
      status: "success",
      trainers,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Trainers not found ",
      err: e,
    });
  }
};

export const getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ trainer_id: req.params.code });

    res.status(200).json({
      status: "success",
      trainer,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Trainer not found",
      err: e,
    });
  }
};

export const searchTrainers = async (req, res) => {
  try {
    const query = {};

    if (req.query.trainer_id) {
      query.trainer_id = req.query.trainer_id;
    }
    if (req.query.fullname) {
      query.fullname = new RegExp(req.query.fullname, "i");
    }
    if (req.query.sport) {
      query.sport = req.query.sport;
    }
    if (req.query.discipline) {
      query.disciplines = req.query.discipline;
    }
    if (req.query.gender) {
      query.gender = req.query.gender;
    }
    if (req.query.region) {
      query.region = new RegExp(req.query.region, "i");
    }

    const trainers = await Trainer.find(query).sort({ fullname: 1 });
    res.status(200).json({
      status: "success",
      results: trainers.length,
      trainers,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: `Ошибка во время поиска: ${e.message}`,
      err: e,
    });
  }
};

export const addNewTrainer = async (req, res) => {
  try {
    const photoUrl = req.files["photo_url"]
      ? `/uploads/images/${req.files["photo_url"][0].filename}`
      : "";

    const trainer = new Trainer({
      photo_url: photoUrl,
      trainer_id: req.body.trainer_id,
      fullname: formatFullname(req.body.fullname),
      birth_date: req.body.birth_date,
      gender: req.body.gender,
      country: req.body.country,
      region: req.body.region,
      sport: req.body.sport,
      disciplines: req.body.disciplines ? JSON.parse(req.body.disciplines) : [],

      trainer_category: req.body.trainer_category,
      rank: req.body.rank ? JSON.parse(req.body.rank) : [],
      position: req.body.position ? JSON.parse(req.body.position) : [],

      is_national_team: req.body.is_national_team,
      socials: req.body.socials ? JSON.parse(req.body.socials) : null,
    });

    await trainer.save();

    res.status(200).json({
      status: "success",
      data: trainer,
    });
  } catch (e) {
    console.error("ADD ERR", e);
    res.status(404).json({
      status: "Err",
      data: `Не удалось добавить тренера: ${e.message}`,
      err: e,
    });
  }
};

export const updateTrainer = async (req, res) => {
  const trainerId = req.params.code;

  try {
    const trainer = await Trainer.findOne({ trainer_id: trainerId });
    if (!trainer) {
      return res.status(404).json({
        status: "Err",
        data: "Тренер с таким кодом не найден",
      });
    }

    const originalPhotoUrl = trainer.photo_url;

    const photoUrl = req.files["photo_url"]
      ? `/uploads/images/${req.files["photo_url"][0].filename}`
      : trainer.photo_url;

    trainer.photo_url = photoUrl;

    trainer.photo_url = req.body.photo_url || trainer.photo_url;
    trainer.trainer_id = req.body.trainer_id || trainer.trainer_id;
    trainer.fullname = req.body.fullname || trainer.fullname;
    trainer.birth_date = req.body.birth_date || trainer.birth_date;
    trainer.gender = req.body.gender || trainer.gender;
    trainer.country = req.body.country || trainer.country;
    trainer.region = req.body.region || trainer.region;
    trainer.sport = req.body.sport || trainer.sport;
    trainer.disciplines = req.body.disciplines
      ? JSON.parse(req.body.disciplines)
      : trainer.disciplines;

    trainer.trainer_category =
      req.body.trainer_category || trainer.trainer_category;
    trainer.rank = req.body.rank ? JSON.parse(req.body.rank) : trainer.rank;
    trainer.position = req.body.position
      ? JSON.parse(req.body.position)
      : trainer.position;

    trainer.is_national_team =
      req.body.is_national_team !== undefined
        ? req.body.is_national_team
        : trainer.is_national_team;

    trainer.socials = req.body.socials
      ? JSON.parse(req.body.socials)
      : trainer.socials;

    await trainer.save();

    if (photoUrl !== originalPhotoUrl && originalPhotoUrl) {
      await removeOldFile(join(__dirname, "..", originalPhotoUrl));
    }

    res.status(200).json({
      status: "success",
      trainer,
    });
  } catch (e) {
    console.error("UPDATE ERR", e);
    res.status(500).json({
      status: "Err",
      data: "Не удалось обновить данные тренера",
      err: e.message,
    });
  }
};

export const deleteTrainer = async (req, res) => {
  const trainerId = req.params.code;

  try {
    const trainer = await Trainer.findOne({
      trainer_id: trainerId,
    });

    if (!trainer) {
      return res.status(404).json({
        status: "Err",
        data: "Тренер с таким кодом не найден",
      });
    }

    if (trainer["photo_url"]) {
      const fullPath = join(__dirname, "..", trainer["photo_url"]);
      try {
        await removeOldFile(fullPath);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    }

    await Trainer.deleteOne({ trainer_id: trainerId });

    res.status(200).json({
      status: "success",
      data: "Тренер был успешно удален",
    });
  } catch (e) {
    console.error("DELETE ERR", e);
    res.status(500).json({
      status: "Err",
      data: "Не удалось удалить тренера",
      err: e.message,
    });
  }
};

export const getTrainerTeam = async (req, res) => {
  try {
    if (!parseInt(req.params.code)) {
      return res.status(404).json({
        status: "error",
        message: "Invalid trainer ID.",
      });
    }

    const trainer = await Trainer.findOne({ trainer_id: req.params.code });
    if (!trainer) {
      return res.status(404).json({
        status: "error",
        message: "Trainer not found.",
      });
    }

    const athletes = await Athlete.find(
      { "trainer.trainer_id": { $eq: req.params.code } },
      {
        gender: 0,
        organizations: 0,
        is_national_team: 0,
        trainer: 0,
        education: 0,
        hobbies: 0,
        athleteAbout: 0,
        equipment: 0,
        medals: 0,
        sponsors: 0,
        socials: 0,
      }
    ).sort({
      lastname: 1,
      name: 1,
    });

    res.status(200).json({
      status: "success",
      athletes,
    });
  } catch (error) {
    console.error("Error fetching athletes by trainer ID:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch athletes.",
      error: error.message,
    });
  }
};

export const getTrainerSeminars = async (req, res) => {
  try {
    const seminars = await Seminar.find(
      {
        "participants.code": req.params.code,
      },
      {
        participants: 0,
        contacts: 0,
      }
    ).sort({ date: -1 });

    res.status(200).json({
      status: "success",
      seminars,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Не удалось получить список семинаров тренера",
      err: e,
    });
  }
};
