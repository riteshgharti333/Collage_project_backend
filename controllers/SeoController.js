import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";
import Course from "../models/courseModel.js";
import ErrorHandler from "../utils/errorHandler.js";

let cachedSitemap = null;
let cacheTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const staticUrls = [
  { url: "/", changefreq: "weekly", priority: 1.0 },
  { url: "/about", changefreq: "monthly", priority: 0.7 },
  { url: "/contact-us", changefreq: "monthly", priority: 0.7 },
  { url: "/alumini", changefreq: "monthly", priority: 0.7 },
  { url: "/enquiry", changefreq: "monthly", priority: 0.7 },
  { url: "/gallery", changefreq: "monthly", priority: 0.7 },
  { url: "/mentor", changefreq: "monthly", priority: 0.7 },
  { url: "/our-staff", changefreq: "monthly", priority: 0.7 },
];

export const getSitemap = catchAsyncError(async (req, res, next) => {
  try {
    if (cachedSitemap && Date.now() - cacheTime < CACHE_DURATION) {
      res.setHeader("Content-Type", "application/xml");
      res.setHeader("Content-Encoding", "gzip");
      return res.send(cachedSitemap);
    }

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Content-Encoding", "gzip");

    const sitemapStream = new SitemapStream({
      hostname: "http://thenad.in",
    });
    const pipeline = sitemapStream.pipe(createGzip());

    const courses = await Course.find({}, "slug updatedAt");

    staticUrls.forEach(({ url, changefreq, priority }) => {
      sitemapStream.write({ url, changefreq, priority });
    });

    courses.forEach((course) => {
      const slug =
        course.slug || course._id || generateSlugFromTitle(course.courseTitle);

      sitemapStream.write({
        url: `/course/${slug}`,
        lastmod: course.updatedAt,
        changefreq: "weekly",
        priority: 0.9,
      });
    });

    sitemapStream.end();

    cachedSitemap = await streamToPromise(pipeline);
    cacheTime = Date.now();

    res.send(cachedSitemap);
  } catch (error) {
    return next(new ErrorHandler("Failed to generate sitemap", 500));
  }
});
