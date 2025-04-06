const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');

// @route   POST /medicines
// @desc    Add new medicine
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, dosage, frequency } = req.body;
    
    // Basic input validation
    if (!name || !dosage || !frequency) {
      return res.status(400).json({ message: 'Name, dosage, and frequency are required' });
    }

    const medicine = new Medicine({
      userId: req.userId,
      ...req.body
    });
    
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /medicines
// @desc    Get all medicines for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// @route   PUT /medicines/:id
// @desc    Update a medicine
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    if (!Medicine.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid medicine ID' });
    }

    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /medicines/:id
// @desc    Delete a medicine
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!Medicine.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid medicine ID' });
    }

    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;