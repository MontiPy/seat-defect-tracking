const Joi = require('joi');

const schemas = {
  createDefect: Joi.object({
    image_id: Joi.number().integer().positive().required(),
    zone_id: Joi.number().integer().positive().required(),
    x: Joi.number().integer().min(0).required(),
    y: Joi.number().integer().min(0).required(),
    cbu: Joi.string().trim().min(1).max(50).required(),
    part_id: Joi.number().integer().positive().required(),
    build_event_id: Joi.number().integer().positive().required(),
    defect_type_id: Joi.number().integer().positive().required(),
    photo_url: Joi.string().uri().optional(),
    noted_by: Joi.string().trim().max(100).optional(),
    iqs_score: Joi.number().valid(4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0).optional(),
  }),

  updateDefect: Joi.object({
    image_id: Joi.number().integer().positive().optional(),
    zone_id: Joi.number().integer().positive().optional(),
    x: Joi.number().integer().min(0).optional(),
    y: Joi.number().integer().min(0).optional(),
    cbu: Joi.string().trim().min(1).max(50).optional(),
    part_id: Joi.number().integer().positive().optional(),
    build_event_id: Joi.number().integer().positive().optional(),
    defect_type_id: Joi.number().integer().positive().optional(),
    photo_url: Joi.string().uri().optional(),
    noted_by: Joi.string().trim().max(100).optional(),
    iqs_score: Joi.number().valid(4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0).optional(),
  }),

  createProject: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
  }),

  createZone: Joi.object({
    image_id: Joi.number().integer().positive().required(),
    name: Joi.string().trim().min(1).max(100).required(),
    coordinates: Joi.array()
      .items(
        Joi.object({
          x: Joi.number().required(),
          y: Joi.number().required(),
        })
      )
      .min(3)
      .required(),
  }),

  createDefectType: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    description: Joi.string().trim().max(500).optional(),
  }),

  id: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }
    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateParams,
};
