const knex = require('../db/knex');
const ExcelJS = require('exceljs');
const { createCanvas, loadImage } = require('canvas');
const h337 = require('heatmap.js');
const path = require('path');

async function exportProjectDefects(req, res, next) {
  try {
    const projectId = req.params.id;
    const images = await knex('images').where('project_id', projectId);

    const workbook = new ExcelJS.Workbook();

    for (const image of images) {
      const worksheet = workbook.addWorksheet(image.filename || `Image ${image.id}`);
      worksheet.columns = [
        { header: 'Defect ID', key: 'id', width: 10 },
        { header: 'X', key: 'x', width: 8 },
        { header: 'Y', key: 'y', width: 8 },
        { header: 'CBU', key: 'cbu', width: 20 },
        { header: 'Part', key: 'part_id', width: 10 },
        { header: 'Event', key: 'build_event_id', width: 10 },
        { header: 'Type', key: 'defect_type_id', width: 10 },
      ];

      const defects = await knex('defects').where('image_id', image.id);
      defects.forEach((d) => worksheet.addRow(d));

      // Path to original image file
      const filePath = path.resolve(__dirname, '../../uploads/defects', path.basename(image.url));
      try {
        const baseImg = await loadImage(filePath);
        const canvas = createCanvas(baseImg.width, baseImg.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImg, 0, 0);

        const heatCanvas = createCanvas(baseImg.width, baseImg.height);
        const heat = h337.create({
          container: heatCanvas,
          radius: 60,
          maxOpacity: 0.65,
          minOpacity: 0.05,
          blur: 0.9,
        });
        heat.setData({
          max: 5,
          data: defects.map((d) => ({ x: d.x, y: d.y, value: 1 })),
        });
        ctx.drawImage(heatCanvas, 0, 0);

        const imgId = workbook.addImage({
          buffer: canvas.toBuffer('image/png'),
          extension: 'png',
        });
        worksheet.addImage(imgId, {
          tl: { col: 8, row: 1 },
          ext: { width: 400, height: 400 },
        });
      } catch (err) {
        console.error('Error rendering heatmap', err);
      }
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="project-defects.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { exportProjectDefects };
