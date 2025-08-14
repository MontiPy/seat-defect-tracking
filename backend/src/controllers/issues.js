// backend/src/controllers/issues.js

const knex = require('../db/knex');
const { success, error } = require('../utils/response');

/**
 * Generate next issue number for a project
 */
async function generateIssueNumber(projectId) {
  const year = new Date().getFullYear();
  const prefix = `ISS-${year}-`;

  const lastIssue = await knex('issues')
    .where('project_id', projectId)
    .where('issue_number', 'like', `${prefix}%`)
    .orderBy('issue_number', 'desc')
    .first();

  let nextNumber = 1;
  if (lastIssue) {
    const lastNumber = parseInt(lastIssue.issue_number.split('-').pop());
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * List issues with optional filtering
 * GET /api/issues?project_id=...&status=...&severity=...
 */
async function listIssues(req, res, next) {
  try {
    const q = knex('issues as i')
      .leftJoin('projects as proj', 'i.project_id', 'proj.id')
      .leftJoin('parts as p', 'i.part_id', 'p.id')
      .select(
        'i.*',
        'proj.name as project_name',
        'p.seat_part_number as part_number',
        'p.description as part_description'
      );

    // Filter by query parameters
    [
      'project_id',
      'status',
      'severity',
      'priority',
      'issue_type',
      'assigned_to',
    ].forEach((field) => {
      if (req.query[field]) {
        q.where(`i.${field}`, req.query[field]);
      }
    });

    // Search by title or description
    if (req.query.search) {
      q.where(function () {
        this.where('i.title', 'like', `%${req.query.search}%`).orWhere(
          'i.description',
          'like',
          `%${req.query.search}%`
        );
      });
    }

    // Order by created_at descending by default
    const orderBy = req.query.sort || 'created_at';
    const orderDirection = req.query.order || 'desc';
    q.orderBy(`i.${orderBy}`, orderDirection);

    const issues = await q;
    res.json(success(issues, 'Issues retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Get single issue by ID with related data
 * GET /api/issues/:id
 */
async function getIssueById(req, res, next) {
  try {
    const issue = await knex('issues as i')
      .leftJoin('projects as proj', 'i.project_id', 'proj.id')
      .leftJoin('parts as p', 'i.part_id', 'p.id')
      .select(
        'i.*',
        'proj.name as project_name',
        'p.seat_part_number as part_number',
        'p.description as part_description'
      )
      .where('i.id', req.params.id)
      .first();

    if (!issue) {
      return res.status(404).json(error('Issue not found', 404));
    }

    // Get comments
    const comments = await knex('issue_comments')
      .where('issue_id', req.params.id)
      .orderBy('created_at', 'asc');

    // Get attachments
    const attachments = await knex('issue_attachments')
      .where('issue_id', req.params.id)
      .orderBy('created_at', 'desc');

    // Get related defects
    const relatedDefects = await knex('issue_defect_relations as idr')
      .join('defects as d', 'idr.defect_id', 'd.id')
      .leftJoin('zones as z', 'd.zone_id', 'z.id')
      .leftJoin('parts as p', 'd.part_id', 'p.id')
      .select(
        'd.*',
        'z.name as zone_name',
        'p.seat_part_number as part_number',
        'idr.relationship_type'
      )
      .where('idr.issue_id', req.params.id);

    const result = {
      ...issue,
      comments,
      attachments,
      related_defects: relatedDefects,
    };

    res.json(success(result, 'Issue retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Create new issue
 * POST /api/issues
 */
async function createIssue(req, res, next) {
  try {
    const {
      project_id,
      title,
      description,
      issue_type,
      severity,
      priority,
      assigned_to,
      reported_by,
      supplier_name,
      part_id,
      due_date,
    } = req.body;

    // Generate issue number
    const issue_number = await generateIssueNumber(project_id);

    const payload = {
      project_id,
      issue_number,
      title,
      description,
      issue_type,
      severity,
      priority,
      assigned_to,
      reported_by,
      supplier_name,
      part_id,
      due_date,
      status: 'open',
    };

    const [newIssue] = await knex('issues').insert(payload).returning('*');

    res.status(201).json(success(newIssue, 'Issue created successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Update existing issue
 * PUT /api/issues/:id
 */
async function updateIssue(req, res, next) {
  try {
    const {
      title,
      description,
      issue_type,
      severity,
      priority,
      status,
      assigned_to,
      supplier_name,
      part_id,
      root_cause,
      corrective_action,
      due_date,
      resolved_date,
    } = req.body;

    const updates = {
      title,
      description,
      issue_type,
      severity,
      priority,
      status,
      assigned_to,
      supplier_name,
      part_id,
      root_cause,
      corrective_action,
      due_date,
      resolved_date,
      updated_at: knex.fn.now(),
    };

    // Remove undefined values
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    const [updated] = await knex('issues')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');

    if (!updated) {
      return res.status(404).json(error('Issue not found', 404));
    }

    res.json(success(updated, 'Issue updated successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Delete issue
 * DELETE /api/issues/:id
 */
async function deleteIssue(req, res, next) {
  try {
    const count = await knex('issues').where('id', req.params.id).del();

    if (count === 0) {
      return res.status(404).json(error('Issue not found', 404));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Add comment to issue
 * POST /api/issues/:id/comments
 */
async function addComment(req, res, next) {
  try {
    const { comment_text, commented_by } = req.body;

    const payload = {
      issue_id: req.params.id,
      comment_text,
      commented_by,
    };

    const [newComment] = await knex('issue_comments')
      .insert(payload)
      .returning('*');

    res.status(201).json(success(newComment, 'Comment added successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Link issue to defect
 * POST /api/issues/:id/defects
 */
async function linkDefect(req, res, next) {
  try {
    const { defect_id, relationship_type, created_by } = req.body;

    const payload = {
      issue_id: req.params.id,
      defect_id,
      relationship_type: relationship_type || 'related_to',
      created_by,
    };

    const [newRelation] = await knex('issue_defect_relations')
      .insert(payload)
      .returning('*');

    res.status(201).json(success(newRelation, 'Defect linked successfully'));
  } catch (err) {
    next(err);
  }
}

/**
 * Remove defect link
 * DELETE /api/issues/:id/defects/:defectId
 */
async function unlinkDefect(req, res, next) {
  try {
    const count = await knex('issue_defect_relations')
      .where({
        issue_id: req.params.id,
        defect_id: req.params.defectId,
      })
      .del();

    if (count === 0) {
      return res.status(404).json(error('Defect relation not found', 404));
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Get issue statistics for dashboard
 * GET /api/issues/stats?project_id=...
 */
async function getIssueStats(req, res, next) {
  try {
    let q = knex('issues');

    if (req.query.project_id) {
      q = q.where('project_id', req.query.project_id);
    }

    const stats = await q
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('SUM(CASE WHEN status = "open" THEN 1 ELSE 0 END) as open'),
        knex.raw(
          'SUM(CASE WHEN status = "in_progress" THEN 1 ELSE 0 END) as in_progress'
        ),
        knex.raw(
          'SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved'
        ),
        knex.raw(
          'SUM(CASE WHEN status = "closed" THEN 1 ELSE 0 END) as closed'
        ),
        knex.raw(
          'SUM(CASE WHEN severity = "critical" THEN 1 ELSE 0 END) as critical'
        ),
        knex.raw(
          'SUM(CASE WHEN severity = "major" THEN 1 ELSE 0 END) as major'
        ),
        knex.raw(
          'SUM(CASE WHEN priority = "urgent" THEN 1 ELSE 0 END) as urgent'
        )
      )
      .first();

    res.json(success(stats, 'Issue statistics retrieved successfully'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  addComment,
  linkDefect,
  unlinkDefect,
  getIssueStats,
};
