const Teacher = require("../models/teacher.model");
const mongoose = require("mongoose");

// Helper function to validate time format (HH:MM)
const isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
};

// Helper function to validate time range format (HH:MM-HH:MM)
const isValidTimeRange = (range) => {
  if (!range || typeof range !== "string") return false;
  
  const parts = range.split("-");
  if (parts.length !== 2) return false;
  
  const [start, end] = parts;
  
  // Check format
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) return false;
  
  // Parse times
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  
  // Check if within allowed range (7:00 to 17:00)
  if (sh < 7 || sh > 17 || eh < 7 || eh > 17) return false;
  if (sh === 17 && sm > 0) return false;
  if (eh === 17 && em > 0) return false;
  
  // Check if minutes are in 30-minute intervals
  if (sm !== 0 && sm !== 30) return false;
  if (em !== 0 && em !== 30) return false;
  
  // Check if start is before end
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (startMinutes >= endMinutes) return false;
  
  return true;
};

// Helper function to expand time range into 30-minute slots
const expandTimeRange = (range) => {
  const [start, end] = range.split("-");
  const times = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  while (h < eh || (h === eh && m <= em)) {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    times.push(`${hh}:${mm}`);
    m += 30;
    if (m >= 60) {
      h++;
      m = 0;
    }
  }

  return times;
};

// Helper function to check for schedule conflicts
const hasScheduleConflict = (subjects) => {
  const scheduleMap = {};
  const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const { day, time } = subject;
    
    // Skip if day or time is missing
    if (!day || !time) {
      return {
        hasConflict: true,
        isValidationError: true,
        error: `Subject at index ${i} is missing day or time field.`,
      };
    }

    // Validate day
    if (!validDays.includes(day)) {
      return {
        hasConflict: true,
        isValidationError: true,
        error: `Invalid day "${day}" for subject at index ${i}. Must be one of: ${validDays.join(", ")}.`,
      };
    }

    // Validate time format
    if (!isValidTimeRange(time)) {
      return {
        hasConflict: true,
        isValidationError: true,
        error: `Invalid time format "${time}" for subject at index ${i}. Time must be in format "HH:MM-HH:MM" (e.g., "08:00-10:30"), use 30-minute intervals, be within 7:00-17:00, and start time must be before end time.`,
      };
    }

    // Expand the time range into slots
    const timeSlots = expandTimeRange(time);

    // Initialize day if not exists
    if (!scheduleMap[day]) {
      scheduleMap[day] = {};
    }

    // Check each time slot for conflicts
    for (const slot of timeSlots) {
      if (scheduleMap[day][slot]) {
        // Conflict found!
        return {
          hasConflict: true,
          isValidationError: false,
          conflict: {
            day,
            time: slot,
            existingSubject: scheduleMap[day][slot],
            newSubject: subject.subject_id,
          },
        };
      }
      // Mark this slot as occupied
      scheduleMap[day][slot] = subject.subject_id;
    }
  }

  return { hasConflict: false };
};


// ✅ Get all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate(
      "account_ref", "firstname lastname email department user_type photo"
    )
    .populate("subjects.subject_id", "code subject_name units year_level semester department");
    res.status(200).json({
      message: "Teachers retrieved successfully!",
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve teachers", error: error.message });
  }
};


// ✅ Get one teacher
const getTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Teacher ID" });

    const teacher = await Teacher.findById(id).populate(
      "account_ref",
      "firstname lastname email department user_type photo"
    ).populate("subjects.subject_id")
    ;
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res
      .status(200)
      .json({ message: "Teacher retrieved successfully!", data: teacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve teacher", error: error.message });
  }
};

// ✅ Create a new teacher
const createTeacher = async (req, res) => {
  try {
    const { account_ref, teacher_uid, departments, subjects } = req.body;

    const existingTeacher = await Teacher.findOne({ teacher_uid });
    if (existingTeacher)
      return res.status(409).json({ message: "Teacher UID already exists" });

    const newTeacher = new Teacher({
      account_ref,
      teacher_uid,
      departments,
      subjects,
    });

    await newTeacher.save();
    res
      .status(201)
      .json({ message: "Teacher created successfully!", data: newTeacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create teacher", error: error.message });
  }
};

// ✅ Update teacher
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Teacher ID" });

    // Check if the update includes subjects (schedule changes)
    if (req.body.subjects && Array.isArray(req.body.subjects)) {
      // Validate schedule for conflicts
      const conflictCheck = hasScheduleConflict(req.body.subjects);
      
      if (conflictCheck.hasConflict) {
        // Handle validation errors
        if (conflictCheck.isValidationError) {
          return res.status(400).json({
            message: "Schedule validation error",
            error: conflictCheck.error,
          });
        }
        
        // Handle schedule conflicts
        const { day, time, existingSubject, newSubject } = conflictCheck.conflict;
        return res.status(400).json({
          message: "Schedule conflict detected",
          error: `A subject is already scheduled on ${day} at ${time}. Cannot assign multiple subjects to the same time slot.`,
          conflict: {
            day,
            time,
            existingSubject,
            newSubject,
          },
        });
      }
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    
    if (!updatedTeacher)
      return res.status(404).json({ message: "Teacher not found" });

    res
      .status(200)
      .json({ message: "Teacher updated successfully!", data: updatedTeacher });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update teacher", error: error.message });
  }
};


// ✅ Delete teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Teacher ID" });

    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    if (!deletedTeacher)
      return res.status(404).json({ message: "Teacher not found" });

    res.status(200).json({ message: "Teacher deleted successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete teacher", error: error.message });
  }
};

// teacher.controller.js → getTeacherByAccID
// teacher.controller.js
// teacher.controller.js → getTeacherByAccID
const getTeacherByAccID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Account ID" });
    }

    const teacher = await Teacher.findOne({ account_ref: id })
      .populate("account_ref", "firstname lastname email")
      .populate({
        path: "subjects.subject_id",        // This is the correct path
        select: "code subject_name department units",
        model: "Subject"
      });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // OPTIONAL: Log to confirm data is populated
    console.log("Teacher loaded:", teacher.fullName, "Classes:", teacher.subjects.length);

    res.status(200).json({
      message: "Teacher retrieved successfully!",
      data: teacher,
    });
  } catch (error) {
    console.error("Error in getTeacherByAccID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherByAccID,
};
