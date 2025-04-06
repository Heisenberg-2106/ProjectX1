import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get all doctors (with filtering)
// @route   GET /api/doctors
// @access  Public
export const getAllDoctors = catchAsync(async (req, res, next) => {
  // Filtering (example: /api/doctors?specialty=Cardiology&minRating=4)
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((field) => delete queryObj[field]);

  // Advanced filtering (convert gte, gt, lte, lt to MongoDB operators)
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Doctor.find(JSON.parse(queryStr)).populate('user', 'name email photo');

  // Sorting (example: /api/doctors?sort=-consultationFee,rating)
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default sorting
  }

  // Pagination (example: /api/doctors?page=2&limit=10)
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const doctors = await query;

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: {
      doctors,
    },
  });
});

// @desc    Get a single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id).populate('user', 'name email photo');

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctor,
    },
  });
});

// @desc    Update doctor profile (for doctors only)
// @route   PATCH /api/doctors/:id
// @access  Private/Doctor
export const updateDoctor = catchAsync(async (req, res, next) => {
  // 1) Check if the doctor exists
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  // 2) Check if the logged-in user is the doctor's user account
  if (doctor.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this profile', 403));
  }

  // 3) Filter out unwanted fields that shouldn't be updated
  const filteredBody = { ...req.body };
  const restrictedFields = ['user', 'rating', 'reviews'];
  restrictedFields.forEach((field) => delete filteredBody[field]);

  // 4) Update doctor document
  const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      doctor: updatedDoctor,
    },
  });
});

// @desc    Add available time slot (for doctors only)
// @route   POST /api/doctors/:id/slots
// @access  Private/Doctor
export const addAvailableSlot = catchAsync(async (req, res, next) => {
  const { date, startTime, endTime } = req.body;

  // 1) Check if the doctor exists
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  // 2) Check if the logged-in user is the doctor's user account
  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to add slots for this doctor', 403));
  }

  // 3) Check for slot conflicts
  const hasConflict = doctor.availableSlots.some(
    (slot) =>
      slot.date.toISOString() === new Date(date).toISOString() &&
      ((startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime))
  );

  if (hasConflict) {
    return next(new AppError('This time slot conflicts with an existing slot', 400));
  }

  // 4) Add the new slot
  doctor.availableSlots.push({ date, startTime, endTime });
  await doctor.save();

  res.status(201).json({
    status: 'success',
    data: {
      slots: doctor.availableSlots,
    },
  });
});

// @desc    Delete a time slot (for doctors only)
// @route   DELETE /api/doctors/:id/slots/:slotId
// @access  Private/Doctor
export const deleteAvailableSlot = catchAsync(async (req, res, next) => {
  // 1) Check if the doctor exists
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  // 2) Check if the logged-in user is the doctor's user account
  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to delete slots for this doctor', 403));
  }

  // 3) Find and remove the slot
  const slotIndex = doctor.availableSlots.findIndex(
    (slot) => slot._id.toString() === req.params.slotId
  );

  if (slotIndex === -1) {
    return next(new AppError('No slot found with that ID', 404));
  }

  // 4) Check if the slot is already booked
  const slot = doctor.availableSlots[slotIndex];
  if (slot.isBooked) {
    return next(new AppError('Cannot delete a booked slot. Cancel appointments first.', 400));
  }

  doctor.availableSlots.splice(slotIndex, 1);
  await doctor.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// @desc    Get doctor's upcoming appointments
// @route   GET /api/doctors/:id/appointments
// @access  Private/Doctor
export const getDoctorAppointments = catchAsync(async (req, res, next) => {
  // 1) Check if the doctor exists
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  // 2) Check if the logged-in user is the doctor's user account
  if (doctor.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to view these appointments', 403));
  }

  // 3) Get appointments
  const appointments = await Appointment.find({
    doctor: req.params.id,
    status: { $in: ['confirmed', 'pending'] },
    date: { $gte: new Date() },
  })
    .populate('user', 'name email')
    .sort({ date: 1, startTime: 1 });

  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

// @desc    Add a review for a doctor
// @route   POST /api/doctors/:id/reviews
// @access  Private/Patient
export const addReview = catchAsync(async (req, res, next) => {
  const { rating, comment } = req.body;

  // 1) Check if the doctor exists
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  // 2) Check if user has any completed appointments with this doctor
  const hasAppointment = await Appointment.findOne({
    user: req.user.id,
    doctor: req.params.id,
    status: 'completed',
  });

  if (!hasAppointment) {
    return next(
      new AppError('You can only review doctors you have had appointments with', 400)
    );
  }

  // 3) Check if user already reviewed this doctor
  const alreadyReviewed = doctor.reviews.find(
    (review) => review.user.toString() === req.user.id.toString()
  );

  if (alreadyReviewed) {
    return next(new AppError('You have already reviewed this doctor', 400));
  }

  // 4) Add the review
  const review = {
    user: req.user.id,
    rating,
    comment,
  };

  doctor.reviews.push(review);

  // 5) Update doctor rating (average)
  if (doctor.reviews.length > 0) {
    doctor.rating =
      doctor.reviews.reduce((acc, item) => item.rating + acc, 0) / doctor.reviews.length;
  }

  await doctor.save();

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});