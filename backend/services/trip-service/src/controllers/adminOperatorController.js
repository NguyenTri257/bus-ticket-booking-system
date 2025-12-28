// controllers/adminOperatorController.js
const operatorRepo = require('../repositories/operatorRepository');
const {
  approveSchema,
  suspendSchema,
  listQuerySchema,
} = require('../validators/adminOperatorValidators');

class AdminOperatorController {
  async getList(req, res) {
    try {
      const { error, value } = listQuerySchema.validate(req.query);
      if (error) return res.status(400).json({ success: false, error: error.details[0].message });

      const result = await operatorRepo.findAll(value);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async approveOperator(req, res) {
    try {
      const { operatorId } = req.params;

      const { error, value } = approveSchema.validate(req.body);
      if (error) return res.status(400).json({ success: false, error: error.details[0].message });

      const status = value.approved ? 'approved' : 'rejected';
      const updated = await operatorRepo.updateStatus(operatorId, status, value.notes);

      res.json({
        success: true,
        data: updated,
        message: value.approved ? 'Operator approved successfully' : 'Operator rejected',
      });
    } catch (err) {
      if (err.message === 'Operator not found') {
        return res.status(404).json({ success: false, error: 'Operator not found' });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async suspendOperator(req, res) {
    try {
      const { operatorId } = req.params;

      const { error, value } = suspendSchema.validate(req.body);
      if (error) return res.status(400).json({ success: false, error: error.details[0].message });

      const updated = await operatorRepo.updateStatus(operatorId, 'suspended', value.notes);

      res.json({
        success: true,
        data: updated,
        message: 'Operator suspended successfully',
      });
    } catch (err) {
      if (err.message === 'Operator not found') {
        return res.status(404).json({ success: false, error: 'Operator not found' });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async activateOperator(req, res) {
    try {
      const { operatorId } = req.params;

      const updated = await operatorRepo.updateStatus(operatorId, 'approved');

      res.json({
        success: true,
        data: updated,
        message: 'Operator activated successfully',
      });
    } catch (err) {
      if (err.message === 'Operator not found') {
        return res.status(404).json({ success: false, error: 'Operator not found' });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async getAnalytics(req, res) {
    try {
      const analytics = await operatorRepo.getAnalytics();

      res.json({
        success: true,
        data: analytics,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getOperatorAnalytics(req, res) {
    try {
      const { operatorId } = req.params;

      const analytics = await operatorRepo.getOperatorAnalytics(operatorId);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (err) {
      if (err.message === 'Operator not found') {
        return res.status(404).json({ success: false, error: 'Operator not found' });
      }
      console.error(err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
module.exports = new AdminOperatorController();
