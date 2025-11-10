const mongoose = require("mongoose");
const Schedule = require("../models/schedule.model");

mongoose.connect(
  "mongodb+srv://Dej-Vu:dejvu0913@medina-institute-of-exc.f1inzq0.mongodb.net/Student-Management-System"
);

const mapping = {
  "69033abb1c2405b9a9b23942": "69035f821e032f62d81da066",
  "69033abb1c2405b9a9b23943": "69035f821e032f62d81da067",
  "69033abb1c2405b9a9b23944": "69035f821e032f62d81da068",
  "69033abb1c2405b9a9b23945": "69035f821e032f62d81da069",
  "69033abb1c2405b9a9b23946": "69035f821e032f62d81da06a",
  "69033abb1c2405b9a9b23947": "69035f821e032f62d81da06b",
  "69033abb1c2405b9a9b23948": "69035f821e032f62d81da06c",
  "69033abb1c2405b9a9b23949": "69035f821e032f62d81da06d",
  "69034eb41e032f62d81da048": "69035f821e032f62d81da06e",
};

(async () => {
  try {
    const schedules = await Schedule.find();

    for (const schedule of schedules) {
      if (!schedule.schedules?.length) continue;

      for (const sched of schedule.schedules) {
        const currentRef = sched.teacher_ref?.toString();

        if (!currentRef) {
          console.warn(
            `No teacher_ref in one schedule entry of ${schedule._id}`
          );
          continue;
        }

        if (mapping[currentRef]) {
          const newRef = mapping[currentRef];
          sched.teacher_ref = new mongoose.Types.ObjectId(newRef);
          console.log(
            `Replaced ${currentRef} → ${newRef} in schedule ${schedule._id}`
          );
          await schedule.save();
        } else {
          console.log(
            `Unmapped ref: ${currentRef} in schedule ${schedule._id}`
          );
        }
      }
    }

    console.log("Teacher reference migration (Y → X) complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
})();
