const mongoose = require("mongoose");
const Subject = require("../models/subject.model");
const Schedule = require("../models/schedule.model");

mongoose.connect(
  "mongodb+srv://Dej-Vu:dejvu0913@medina-institute-of-exc.f1inzq0.mongodb.net/Student-Management-System",
  { serverSelectionTimeoutMS: 10000 }
);

(async () => {
  try {
    const schedules = await Schedule.find();

    for (const schedule of schedules) {
      if (!schedule.schedules?.length) continue;
      let modified = false;

      for (const course of schedule.schedules) {
        const courseCode = course.course_code;
        if (!courseCode) {
          console.warn(`No course_code in one entry of ${schedule._id}`);
          continue;
        }

        // Match subject by its 'code' field
        const subject = await Subject.findOne({ code: courseCode });

        if (subject) {
          course.subject_ref = subject._id;
          console.log(
            `Linked subject ${subject.code} → ${subject._id} in schedule ${schedule._id}`
          );
          modified = true;
        } else {
          console.warn(`No Subject found for course_code: ${courseCode}`);
        }
      }

      if (modified) {
        await schedule.save();
        console.log(`Saved updated schedule ${schedule._id}`);
      }
    }

    console.log("Subject reference migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
})();
