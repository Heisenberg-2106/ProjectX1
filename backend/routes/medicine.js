const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const auth = require('../middleware/auth');

// Add new medicine
router.post('/', auth, async (req, res) => {
  try {
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

// Get all medicines for user
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a medicine
router.put('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;