const mongoose = require("mongoose");
const Student = require("../models/student.model");
const Schedule = require("../models/schedule.model");

mongoose.connect(
  "mongodb+srv://Dej-Vu:dejvu0913@medina-institute-of-exc.f1inzq0.mongodb.net/Student-Management-System"
);

(async () => {
  try {
    const schedules = await Schedule.find();

    for (const schedule of schedules) {
      // 1. Get the student_number from the schedule document
      const studentNumber = schedule.student_number;

      // 2. Find matching student in student collection
      const student = await Student.findOne({ student_number: studentNumber });

      if (student) {
        // 3. Get the student's ObjectId

        const studentId = student._id;

        schedule.student_ref = studentId;
        const now = new Date();

        if (!schedule.createdAt) schedule.createdAt = now;
        if (!schedule.updatedAt) schedule.updatedAt = now;
        if (schedule.__v === undefined) schedule.__v = 0;
        await schedule.save();
        console.log(`Updated schedule ${schedule._id}`);
        console.log(
          `Linked ${studentNumber} → ${studentId} for schedule ${schedule._id} `
        );
      } else {
        console.warn(`No match found for student_number: ${studentNumber}`);
      }

      // 3. Add version key if missing
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.connection.close();
  }
})();
