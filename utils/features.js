import jwt from "jsonwebtoken";

export const sendCookie = (user, res, message, statusCode = 200) => {
  const sessionToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "180d",
  });

  res
    .status(statusCode)
    .cookie("sessionToken", sessionToken, {
      httpOnly: true,
      maxAge: 180 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV !== "Development",
    })
    .json({
      result: 1,
      message,
      sessionToken,
      user,
    });
};
