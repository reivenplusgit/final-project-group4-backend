const mongoose = require("mongoose");
const Student = require("../models/student.model.js");
const Schedule = require("../models/schedule.model.js");

const getNumOfStudents = async(req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({message: "ObjectID is not valid"})
        }

        const schedule = await Schedule.aggregate([
            {
                $unwind: "$schedules"
            }, {
                $match: {
                    "schedules.teacher_ref": new mongoose.Types.ObjectId(id)
                }
            }, {
                $count: "total"
            }
        ])

        if (!schedule) {
            return res.status(404).json({message: "Not found"});
        }

        res.status(200).json({message: "Number of students with records retrieved", data: schedule})

    } catch (error) {
        res.status(500).json({message: error.message});
        console.log({ message: error.message });
    }
}

module.exports = {
    getNumOfStudents
}