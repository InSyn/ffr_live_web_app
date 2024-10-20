export const extractSponsorFields = (req, res, next) => {
  try {
    req.sponsorImages = []; // Ensure it's an array

    // Parse the sponsors field if it exists
    if (req.body.sponsors) {
      const sponsors = JSON.parse(req.body.sponsors);

      sponsors.forEach((sponsor, index) => {
        req.sponsorImages.push({ name: `sponsor${index}_logo`, maxCount: 1 });
      });
    }

    console.log("Sponsor fields:", req.sponsorImages);
    next();
  } catch (error) {
    console.error("Error parsing sponsor fields:", error);
    res.status(400).json({ status: "Err", data: "Invalid sponsors format" });
  }
};
