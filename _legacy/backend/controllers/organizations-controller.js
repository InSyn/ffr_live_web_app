import { Organization, OrganizationReport } from '../models/organization-model.js';
import { Athlete } from '../models/athlete-model.js';
import { deleteFileIfExists, parseJsonFields } from '../utils/filesUtils.js';

export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({}, { reports: 0 }).sort({
      title: 1,
    });
    res.status(200).json({
      status: 'success',
      organizations,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'Organizations not found',
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
      query.region = new RegExp(req.query.region, 'i');
    }

    const organizations = await Organization.find(query).sort({ title: 1 });
    res.status(200).json({
      status: 'success',
      results: organizations.length,
      organizations,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'Organizations not found',
      err: e,
    });
  }
};

export const addNewOrganization = async (req, res) => {
  try {
    const logoUrl = req.files['logo_url'] ? `/uploads/images/${req.files['logo_url'][0].filename}` : '';
    const parsedFields = parseJsonFields(req.body, ['contacts', 'socials']);

    const organization = new Organization({
      logo_url: logoUrl,
      title: req.body.title,
      country: req.body.country,
      region: req.body.region,
      sport: req.body.sport,
      ...parsedFields,
    });

    await organization.save();

    res.status(201).json({
      status: 'success',
      organization,
    });
  } catch (e) {
    console.error('ADD ERR', e);
    res.status(404).json({
      status: 'Err',
      message: `Ошибка при создании организации: ${e.message}`,
      err: e,
    });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Организация не найдена',
      });
    }

    const originalLogoUrl = organization.logo_url;
    const logoUrl = req.files['logo_url'] ? `/uploads/images/${req.files['logo_url'][0].filename}` : organization.logo_url;

    const parsedFields = parseJsonFields(req.body, ['contacts', 'socials']);

    organization.set({
      logo_url: logoUrl,
      title: req.body.title || organization.title,
      country: req.body.country || organization.country,
      region: req.body.region || organization.region,
      sport: req.body.sport || organization.sport,
      ...parsedFields,
    });

    await organization.save();

    if (logoUrl !== originalLogoUrl && originalLogoUrl) {
      await deleteFileIfExists(originalLogoUrl);
    }

    res.status(200).json({
      status: 'success',
      organization,
    });
  } catch (e) {
    console.error('UPDATE ERR', e);
    res.status(500).json({
      status: 'Err',
      message: 'Не удалось обновить данные организации',
      err: e.message,
    });
  }
};

export const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id, { reports: 0 });

    res.status(200).json({
      status: 'success',
      organization,
    });
  } catch (e) {
    res.status(404).json({
      status: 'Err',
      message: 'Организация не найдена',
      err: e,
    });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Организация не найдена',
      });
    }

    if (organization.logo_url) {
      await deleteFileIfExists(organization.logo_url);
    }

    await organization.deleteOne();

    res.status(200).json({
      status: 'success',
      data: 'Организация была успешно удалена',
    });
  } catch (e) {
    console.error('DELETE ERR', e);
    res.status(500).json({
      status: 'Err',
      message: 'Не удалось удалить организацию',
      err: e.message,
    });
  }
};

export const addReportToOrganization = async (req, res) => {
  try {
    const organization = await Organization.findOne({ region: req.params.region });
    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Организация не найдена',
      });
    }

    const files = req.files['files'];
    let fileUrls = [];
    if (files && files.length > 0) {
      fileUrls = files.map((file) => `/uploads/images/${file.filename}`);
    }
    const reportData = {
      title: req.body.title,
      content: req.body.content,
      report_date: req.body.report_date,
      files: fileUrls.map((url) => ({ url })),
    };

    const report = new OrganizationReport(reportData);
    await report.save();

    organization.reports.push(report._id);
    await organization.save();

    res.status(201).json({
      status: 'Success',
      message: 'Отчёт добавлен успешно',
      data: {
        report,
      },
    });
  } catch (e) {
    console.error(`Ошибка при добавлении отчёта: ${e}`);
    res.status(500).json({
      status: 'Err',
      message: `Не удалось добавить отчёт: ${e.message}`,
      error: e.message,
    });
  }
};
export const deleteReport = async (req, res) => {
  try {
    const { id, report_id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Организация не найдена',
      });
    }

    const reportIndex = organization.reports.indexOf(report_id);
    if (reportIndex === -1) {
      return res.status(404).json({
        status: 'Err',
        message: 'Отчет не найден',
      });
    }

    organization.reports.splice(reportIndex, 1);
    await organization.save();

    const report = await OrganizationReport.findById(report_id);
    if (report) {
      if (report.files && report.files.length > 0) {
        for (const file of report.files) {
          await deleteFileIfExists(file.url);
        }
      }

      await report.deleteOne();
    }

    res.status(200).json({
      status: 'success',
      message: 'Отчет удален',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      status: 'Err',
      message: `Ошибка при удалении отчета: ${error.message}`,
      err: error,
    });
  }
};
export const updateReport = async (req, res) => {
  try {
    const { organization_id, report_id } = req.params;
    console.log(req.params);

    const organization = await Organization.findById(organization_id);
    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Организация не найдена',
      });
    }

    const report = await OrganizationReport.findById(report_id);
    if (!report) {
      return res.status(404).json({
        status: 'Err',
        message: 'Отчёт не был найден',
      });
    }

    report.set({
      title: req.body.title || report.title,
      content: req.body.content || report.content,
      report_date: req.body.report_date || report.report_date,
    });

    const newFiles = req.files['files'];
    if (newFiles && newFiles.length > 0) {
      if (report.files && report.files.length > 0) {
        for (const file of report.files) {
          await deleteFileIfExists(file.url);
        }
      }
      report.files = newFiles.map((file) => ({ url: `/uploads/images/${file.filename}` }));
    }

    await report.save();

    res.status(200).json({
      status: 'success',
      message: 'Отчёт обновлен',
      report,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      status: 'Err',
      message: `Ошибка при обновлении отчета: ${error.message}`,
      error: error.message,
    });
  }
};
export const getReports = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findById(id).populate('reports');

    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Организация не найдена',
      });
    }

    res.status(200).json({
      status: 'success',
      reports: organization.reports,
    });
  } catch (error) {
    console.error(`Ошибка при получении отчетов организации: ${error}`);
    res.status(500).json({
      status: 'Err',
      message: `Во время получения отчетов организации произошла ошибка: ${error.message}`,
      error: error.message,
    });
  }
};
export const getReportById = async (req, res) => {
  try {
    const { report_id } = req.params;
    const report = await OrganizationReport.findById(report_id);

    if (!report) {
      return res.status(404).json({
        status: 'Err',
        message: 'Отчет не найден',
      });
    }

    res.status(200).json({
      status: 'success',
      report,
    });
  } catch (error) {
    console.error(`Ошибка при получении отчета: ${error}`);
    res.status(500).json({
      status: 'Err',
      message: `Во время получения отчета произошла ошибка: ${error.message}`,
      error: error.message,
    });
  }
};

export const getAthletesByOrganizationRegion = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Organization not found.',
      });
    }

    const athletes = await Athlete.find({ regions: organization.region }, {}).sort({ lastname: 1, name: 1 });

    res.status(200).json({
      status: 'success',
      athletes,
    });
  } catch (error) {
    console.error('Error fetching athletes by organization region:', error);
    res.status(500).json({
      status: 'Err',
      message: 'Failed to fetch athletes.',
      error: error.message,
    });
  }
};

export const getOrganizationByRegion = async (req, res) => {
  try {
    const region = req.params.region;
    const organization = await Organization.findOne({ region }, { contacts: 0, logo_url: 0, socials: 0, reports: 0 });

    if (!organization) {
      return res.status(404).json({
        status: 'Err',
        message: 'Организация не найдена',
      });
    }

    res.status(200).json({
      status: 'success',
      organization,
    });
  } catch (err) {
    console.error('Ошибка при получении ID организации:', err);
    res.status(500).json({
      status: 'Err',
      message: 'Не удалось получить ID организации',
      error: err.message,
    });
  }
};
