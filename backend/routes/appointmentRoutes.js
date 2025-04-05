import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createAppointment,
  getUserAppointments,
  cancelAppointment,
} from '../controllers/appointmentController.js';

const router = express.Router();

router.route('/').post(protect, createAppointment);
router.route('/myappointments').get(protect, getUserAppointments);
router.route('/:id/cancel').put(protect, cancelAppointment);

export default router;