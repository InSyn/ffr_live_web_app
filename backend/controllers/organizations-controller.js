import { dirname, join } from "path";
import { removeOldFile } from "../file-storage/fileStorage.js";
import { Organization } from "../models/organization-model.js";
import { Athlete } from "../models/athlete-model.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find().sort({
      title: 1,
    });
    res.status(200).json({
      status: "success",
      organizations,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Organizations not found",
      err: e,
    });
  }
};

export const searchOrganizations = async (req, res) => {
  try {
    const query = {};

    if (req.query.title) {
      query.$text = { $search: req.query.title };
    }
    if (req.query.sport) {
      query.sport = req.query.sport;
    }
    if (req.query.region) {
      query.region = new RegExp(req.query.region, "i");
    }

    const organizations = await Organization.find(query).sort({ title: 1 });
    res.status(200).json({
      status: "success",
      results: organizations.length,
      organizations,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Organizations not found",
      err: e,
    });
  }
};

export const addNewOrganization = async (req, res) => {
  try {
    const logoUrl = req.files["logo_url"]
      ? `/uploads/images/${req.files["logo_url"][0].filename}`
      : "";

    const organization = new Organization({
      logo_url: logoUrl,
      title: req.body.title,
      country: req.body.country,
      region: req.body.region,
      sport: req.body.sport,
      contacts: req.body.contacts ? JSON.parse(req.body.contacts) : [],
      socials: req.body.socials ? JSON.parse(req.body.socials) : null,
    });

    await organization.save();

    res.status(201).json({
      status: "success",
      organization,
    });
  } catch (e) {
    console.error("ADD ERR", e);
    res.status(404).json({
      status: "Err",
      data: "Organization wasn't added",
      err: e,
    });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        status: "Err",
        data: "Организация не найдена",
      });
    }

    const originalLogoUrl = organization.logo_url;

    const logoUrl = req.files["logo_url"]
      ? `/uploads/images/${req.files["logo_url"][0].filename}`
      : organization.logo_url;

    organization.logo_url = logoUrl;

    organization.logo_url = req.body.logo_url || organization.logo_url;
    organization.title = req.body.title || organization.title;
    organization.country = req.body.country || organization.country;
    organization.region = req.body.region || organization.region;
    organization.sport = req.body.sport || organization.sport;
    organization.contacts = req.body.contacts
      ? JSON.parse(req.body.contacts)
      : organization.contacts;
    organization.socials = req.body.socials
      ? JSON.parse(req.body.socials)
      : organization.socials;

    await organization.save();

    if (logoUrl !== originalLogoUrl && originalLogoUrl) {
      await removeOldFile(join(__dirname, "..", originalLogoUrl));
    }

    res.status(200).json({
      status: "success",
      organization,
    });
  } catch (e) {
    console.error("UPDATE ERR", e);
    res.status(500).json({
      status: "Err",
      data: "Не удалось обновить данные организации",
      err: e.message,
    });
  }
};

export const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    res.status(200).json({
      status: "success",
      organization,
    });
  } catch (e) {
    res.status(404).json({
      status: "Err",
      data: "Organization not found",
      err: e,
    });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        status: "Err",
        data: "Организация не найдена",
      });
    }

    if (organization["logo_url"]) {
      const fullPath = join(__dirname, "..", organization["logo_url"]);
      try {
        await removeOldFile(fullPath);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    }

    await Organization.deleteOne({ _id: req.params.id });

    res.status(200).json({
      status: "success",
      data: "Организация была успешно удалена",
    });
  } catch (e) {
    console.error("DELETE ERR", e);
    res.status(500).json({
      status: "Err",
      data: "Не удалось удалить организацию",
      err: e.message,
    });
  }
};

export const getAthletesByOrganizationRegion = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        status: "error",
        message: "Organization not found.",
      });
    }

    const athletes = await Athlete.find(
      { regions: organization.region },
      {}
    ).sort({ lastname: 1, name: 1 });

    res.status(200).json({
      status: "success",
      athletes,
    });
  } catch (error) {
    console.error("Error fetching athletes by organization region:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch athletes.",
      error: error.message,
    });
  }
};
