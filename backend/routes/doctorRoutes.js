import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
} from '../controllers/doctorController.js';

const router = express.Router();

router.route('/').get(getDoctors);
router.route('/:id').get(getDoctorById);
router.route('/:id/slots').get(getAvailableSlots);

export default router;