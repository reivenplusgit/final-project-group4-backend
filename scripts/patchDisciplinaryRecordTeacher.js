const mongoose = require("mongoose");
const Disciplinary = require("../models/disciplinary.records.model");

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
    await mongoose.connect(
      "mongodb+srv://Dej-Vu:dejvu0913@medina-institute-of-exc.f1inzq0.mongodb.net/Student-Management-System",
      { serverSelectionTimeoutMS: 10000 }
    );
    console.log("Connected to MongoDB");

    const records = await Disciplinary.find({});
    console.log("Fetched records:", records.length);

    for (const record of records) {
      let modified = false;
      const currentRef = record?.teachers_id?.toString();

      if (!currentRef) {
        console.log(`Record ${record._id} has no teachers_id`);
        continue;
      }

      if (mapping[currentRef]) {
        const newRef = mapping[currentRef];
        record.teachers_id = new mongoose.Types.ObjectId(newRef);
        console.log(
          `Replaced ${currentRef} → ${newRef} in record ${record._id}`
        );
        modified = true;
      } else {
        console.log(`Mapping does not exist for ${currentRef}`);
      }

      if (modified) {
        await record.save({ validateBeforeSave: false });
        console.log(`Saved changes to record ${record._id}`);
      }
    }

    console.log("Teacher reference migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
})();
