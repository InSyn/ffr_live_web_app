import * as fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Athlete } from "../models/athlete-model.js";
import { Event } from "../models/event-model.js";
import { removeOldFile } from "../file-storage/fileStorage.js";
import { formatLastname } from "../utils/formatters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getLastAthleteCode = async () => {
  const lastAthlete = await Athlete.findOne().sort({ _id: -1 });
  const lastIndex = lastAthlete ? lastAthlete["rus_code"] : null;

  return (Number(lastIndex) + 1).toString().padStart(4, "0") || "0001";
};

export const getAllAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.find().sort({ lastname: 1, name: 1 });
    res.status(200).json({
      status: "success",
      athletes,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Competitors not found ",
      err: e,
    });
  }
};

export const searchAthletes = async (req, res) => {
  try {
    const query = {};
    if (req.query.rus_code) {
      query.rus_code = req.query.rus_code;
    }
    if (req.query.name) {
      const [lastname, name] = req.query.name.split(" ");
      if (lastname) query.lastname = new RegExp(lastname, "i");
      if (name) query.name = new RegExp(name, "i");
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
      query.country = new RegExp(req.query.country, "i");
    }
    if (req.query.region) {
      query.regions = new RegExp(req.query.region, "i");
    }
    if (req.query.sport) {
      query.sport = req.query.sport;
    }
    if (req.query.discipline) {
      query.disciplines = new RegExp(req.query.discipline, "i");
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const athletes = await Athlete.find(query).sort({ lastname: 1, name: 1 });

    res.status(200).json({
      status: "success",
      results: athletes.length,
      athletes,
    });
  } catch (error) {
    console.error("Ошибка во время поиска:", error);
    res.status(500).json({
      status: "error",
      message: `Ошибка во время поиска: ${error.message}`,
      error: error.message,
    });
  }
};

export const addNewAthlete = async (req, res) => {
  try {
    const photoUrl = req.files["photo_url"]
      ? `/uploads/images/${req.files["photo_url"][0].filename}`
      : "";
    const photoTvUrl = req.files["photo_tv_url"]
      ? `/uploads/images/${req.files["photo_tv_url"][0].filename}`
      : "";

    const sponsorsFiles = [];
    for (let filesKey in req.files) {
      if (filesKey.includes("sponsor")) {
        sponsorsFiles.push(
          "/uploads/images/" + req.files[filesKey][0].filename
        );
      }
    }

    const athlete = new Athlete({
      rus_code: req.body.rus_code
        ? req.body.rus_code
        : await getLastAthleteCode(),
      name: req.body.name,
      lastname: formatLastname(req.body.lastname),
      gender: req.body.gender,
      birth_date: req.body.birth_date,
      photo_url: photoUrl,
      photo_tv_url: photoTvUrl,
      country: req.body.country,
      country_code: req.body.country_code,
      regions: req.body.regions ? JSON.parse(req.body.regions) : [],
      organizations: req.body.organizations
        ? JSON.parse(req.body.organizations)
        : [],
      sport: req.body.sport,
      disciplines: req.body.disciplines ? JSON.parse(req.body.disciplines) : [],
      category: req.body.category,
      is_national_team: req.body.is_national_team,
      trainer: req.body.trainer ? JSON.parse(req.body.trainer) : null,
      education: req.body.education,
      equipment: req.body.equipment ? JSON.parse(req.body.equipment) : [],
      hobbies: req.body.hobbies ? JSON.parse(req.body.hobbies) : [],
      athleteAbout: req.body.athleteAbout,
      medals: req.body.medals ? JSON.parse(req.body.medals) : [],
      sponsors: req.body.sponsors
        ? JSON.parse(req.body.sponsors).map((sponsor, idx) => {
            return { ...sponsor, logo_url: sponsorsFiles[idx] };
          })
        : [],
      socials: req.body.socials ? JSON.parse(req.body.socials) : null,
    });

    await athlete.save();

    res.status(200).json({
      status: "success",
      data: athlete,
    });
  } catch (e) {
    console.error("ADD ERR", e);
    res.status(404).json({
      status: "Err",
      data: "Athlete wasn't added",
      err: e,
    });
  }
};

export const updateAthlete = async (req, res) => {
  const athleteId = req.params.code;

  try {
    const athlete = await Athlete.findOne({ rus_code: athleteId });
    if (!athlete) {
      return res.status(404).json({
        status: "Err",
        data: "Спортсмен с таким кодом не найден",
      });
    }

    const originalPhotoUrl = athlete.photo_url;
    const originalPhotoTvUrl = athlete.photo_tv_url;
    const originalSponsorLogos = athlete.sponsors.map(
      (sponsor) => sponsor.logo_url
    );

    const photoUrl = req.files["photo_url"]
      ? `/uploads/images/${req.files["photo_url"][0].filename}`
      : athlete.photo_url;
    const photoTvUrl = req.files["photo_tv_url"]
      ? `/uploads/images/${req.files["photo_tv_url"][0].filename}`
      : athlete.photo_tv_url;

    const sponsorsFiles = {};
    for (let filesKey in req.files) {
      if (filesKey.includes("sponsor")) {
        sponsorsFiles[filesKey] =
          "/uploads/images/" + req.files[filesKey][0].filename;
      }
    }
    if (req.body.sponsors) {
      const sponsors = JSON.parse(req.body.sponsors);

      const updatedSponsors = sponsors.map((sponsor, idx) => {
        const sponsorKey = `sponsor${idx}_logo`;
        return {
          ...sponsor,
          logo_url: sponsorsFiles[sponsorKey] || sponsor.logo_url,
        };
      });

      await Promise.all(
        originalSponsorLogos.map(async (logo, idx) => {
          const sponsorKey = `sponsor${idx}_logo`;
          if (sponsorsFiles[sponsorKey] && logo !== sponsorsFiles[sponsorKey]) {
            const oldLogoPath = join(__dirname, "..", logo);
            try {
              const stats = await fs.promises.stat(oldLogoPath);
              if (stats.isFile()) {
                await removeOldFile(oldLogoPath);
              }
            } catch (err) {
              console.error("Failed to delete old sponsor logo:", err);
            }
          }
        })
      );

      athlete.sponsors = updatedSponsors;
    }

    athlete.photo_url = photoUrl;
    athlete.photo_tv_url = photoTvUrl;

    athlete.rus_code = req.body.rus_code || athlete.rus_code;
    athlete.name = req.body.name || athlete.name;
    athlete.lastname = req.body.lastname || athlete.lastname;
    athlete.gender = req.body.gender || athlete.gender;
    athlete.birth_date = req.body.birth_date || athlete.birth_date;
    athlete.category = req.body.category || athlete.category;
    athlete.country = req.body.country || athlete.country;
    athlete.country_code = req.body.country_code || athlete.country_code;
    athlete.sport = req.body.sport || athlete.sport;
    athlete.education = req.body.education || athlete.education;
    athlete.athleteAbout = req.body.athleteAbout || athlete.athleteAbout;

    athlete.regions = req.body.regions
      ? JSON.parse(req.body.regions)
      : athlete.regions;
    athlete.organizations = req.body.organizations
      ? JSON.parse(req.body.organizations)
      : athlete.organizations;
    athlete.disciplines = req.body.disciplines
      ? JSON.parse(req.body.disciplines)
      : athlete.disciplines;
    athlete.trainer = req.body.trainer
      ? JSON.parse(req.body.trainer)
      : athlete.trainer;
    athlete.equipment = req.body.equipment
      ? JSON.parse(req.body.equipment)
      : athlete.equipment;
    athlete.hobbies = req.body.hobbies
      ? JSON.parse(req.body.hobbies)
      : athlete.hobbies;
    athlete.medals = req.body.medals
      ? JSON.parse(req.body.medals)
      : athlete.medals;

    athlete.is_national_team =
      req.body.is_national_team !== undefined
        ? req.body.is_national_team
        : athlete.is_national_team;

    athlete.socials = req.body.socials
      ? JSON.parse(req.body.socials)
      : athlete.socials;

    await athlete.save();

    if (photoUrl !== originalPhotoUrl && originalPhotoUrl) {
      await removeOldFile(join(__dirname, "..", originalPhotoUrl));
    }

    if (photoTvUrl !== originalPhotoTvUrl && originalPhotoTvUrl) {
      await removeOldFile(join(__dirname, "..", originalPhotoTvUrl));
    }

    res.status(200).json({
      status: "success",
      data: athlete,
    });
  } catch (e) {
    console.error("UPDATE ERR", e);
    res.status(500).json({
      status: "Err",
      data: "Не удалось обновить данные спортсмена",
      err: e.message,
    });
  }
};

export const getAthlete = async (req, res) => {
  try {
    const athlete = await Athlete.findOne({ rus_code: req.params.code });

    res.status(200).json({
      status: "success",
      data: athlete,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Athlete not found",
      err: e,
    });
  }
};

export const getAthleteCompetitions = async (req, res) => {
  try {
    const events = await Event.find(
      {
        "competitions.competitors.rus_code": req.params.code,
      },
      {
        created_at: 0,
        description: 0,
        organization: 0,
        timing_provider: 0,
        "competitions.races": 0,
      }
    ).sort({ start_at: -1 });

    res.status(200).json({
      status: "success",
      events,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "No competitions found for the athlete",
      err: e,
    });
  }
};

export const deleteAthlete = async (req, res) => {
  const athleteId = req.params.code;

  try {
    const athlete = await Athlete.findOneAndDelete({
      rus_code: athleteId,
    });

    if (!athlete) {
      return res.status(404).json({
        status: "Err",
        data: "Спортсмен с таким кодом не найден",
      });
    }

    const filesToDelete = [
      athlete["photo_url"],
      athlete["photo_tv_url"],
      ...athlete["sponsors"].map((sponsor) => sponsor.logo_url),
    ];

    for (const filePath of filesToDelete) {
      if (filePath) {
        const fullPath = join(__dirname, "..", filePath);
        try {
          await removeOldFile(fullPath);
        } catch (err) {
          console.error("Failed to delete file:", err);
        }
      }
    }

    await Athlete.deleteOne({ rus_code: athleteId });

    res.status(200).json({
      status: "success",
      data: "Спортсмен был успешно удален",
    });
  } catch (e) {
    console.error("DELETE ERR", e);
    res.status(500).json({
      status: "Err",
      data: "Не удалось удалить спортсмена",
      err: e.message,
    });
  }
};
