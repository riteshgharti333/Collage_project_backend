import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect(
      "mongodb+srv://internationalacademydesign123:internationalacademydesign123@thenad.sxwpygf.mongodb.net/thenadData?retryWrites=true&w=majority&appName=thenad",
    )
    .then(() => console.log("DB Connection Successfull !"))

    .catch((error) => {
      console.log(error);
    });
};
