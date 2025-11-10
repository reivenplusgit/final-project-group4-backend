const mongoose = require("mongoose");
const Grade = require("../models/grade.model");

mongoose.connect(
  "mongodb+srv://Dej-Vu:dejvu0913@medina-institute-of-exc.f1inzq0.mongodb.net/Student-Management-System",
  { serverSelectionTimeoutMS: 10000 }
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
    const grades = await Grade.find();

    for (const grade of grades) {
      if (!grade.grades?.length) continue;
      let modified = false;

      for (const g of grade.grades) {
        const currentRef = g.teacher_ref?.toString();
        if (!currentRef) continue;

        if (mapping[currentRef]) {
          const newRef = mapping[currentRef];
          g.teacher_ref = new mongoose.Types.ObjectId(newRef);
          console.log(`Replaced ${currentRef} → ${newRef} in grade ${grade._id}`);
          modified = true;
        }
      }

      if (modified) {
        await grade.save();
        console.log(`Saved changes to grade ${grade._id}`);
      }
    }

    console.log("Teacher reference migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
})();
