const Complaint = require('../models/Complaint');
const { notifyUser } = require('../utils/notifier');

/**
 * Create a complaint
 * photos are uploaded via multipart/form-data under field name "photos"
 * expected body: title, description, category, location: { address, latitude, longitude }
 */
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, address, latitude, longitude } = req.body;
    const photos = (req.files || []).map(f => `/uploads/${f.filename}`);

    if (!title) return res.status(400).json({ message: 'Title is required' });

    const complaint = new Complaint({
      title,
      description,
      category: category || 'general',
      photos,
      location: { address, latitude: latitude ? Number(latitude) : undefined, longitude: longitude ? Number(longitude) : undefined },
      createdBy: req.user._id
    });

    await complaint.save();

    // notify admin/authority? Here we can send notifications to admin role — for simplicity we skip broadcasting.
    res.status(201).json({ complaint });
  } catch (err) {
    next(err);
  }
};

exports.getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate('createdBy', 'name email').populate('assignedTo', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

exports.searchComplaintsPublic = async (req, res, next) => {
  try {
    // public endpoint to show complaints; can filter by status/resolved
    const { status, category, lat, lng, radiusKm, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;

    // Basic geofilter (very simple): if lat/lng provided, filter by bounding box ~ radiusKm
    if (lat && lng && radiusKm) {
      const latNum = Number(lat);
      const lngNum = Number(lng);
      const km = Number(radiusKm);
      // 1 degree lat ~= 111 km, 1 degree lon ~= 111*cos(lat)
      const latDelta = km / 111;
      const lngDelta = km / (111 * Math.cos(latNum * (Math.PI / 180)));
      q['location.latitude'] = { $gte: latNum - latDelta, $lte: latNum + latDelta };
      q['location.longitude'] = { $gte: lngNum - lngDelta, $lte: lngNum + lngDelta };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const complaints = await Complaint.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};
