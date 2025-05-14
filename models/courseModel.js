import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    bannerTitle: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    courseType: {
      type: String,
      required: true,
    },
    courseTitle: {
      type: String,
    },
    courseDescription: {
      type: String,
    },

    courseOfCoursesTitle: {
      type: String,
    },
    courseOfCoursesLists: [
      {
        item: {
          type: String,
        },
      },
    ],

    topicTitle: {
      type: String,
    },
    topicLists: [
      {
        item: {
          type: String,
        },
      },
    ],

    careerTitle: {
      type: String,
    },
    careerLists: [
      {
        item: {
          type: String,
        },
      },
    ],

    courseListTitle: {
      type: String,
    },
    courseListDesc: {
      type: String,
    },
    courseLists: [
      {
        title: {
          type: String,
        },
        desc: {
          type: String,
        },
      },
    ],

    overviewTitle: {
      type: String,
    },

    overviewDesc: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseSchema);
