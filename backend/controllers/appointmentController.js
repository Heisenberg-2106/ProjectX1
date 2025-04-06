import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const { doctor, slot, date, startTime, endTime, notes, symptoms } = req.body;
    const userId = req.user._id;

    // Check if slot is available
    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const slotToBook = doctorDoc.availableSlots.id(slot);
    if (!slotToBook || slotToBook.isBooked) {
      return res.status(400).json({ message: 'Slot not available' });
    }

    // Create appointment
    const appointment = new Appointment({
      user: userId,
      doctor,
      slot,
      date,
      startTime,
      endTime,
      notes,
      symptoms,
      status: 'confirmed'
    });

    // Mark slot as booked
    slotToBook.isBooked = true;
    await doctorDoc.save();

    const createdAppointment = await appointment.save();
    
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user appointments
// @route   GET /api/appointments/myappointments
// @access  Private
export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('doctor', 'name specialty')
      .sort({ date: 1, startTime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns the appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment already cancelled' });
    }

    // Free up the slot
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      const slot = doctor.availableSlots.id(appointment.slot);
      if (slot) {
        slot.isBooked = false;
        await doctor.save();
      }
    }

    // Update appointment status
    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};