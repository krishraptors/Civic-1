const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { notifyUser } = require('../utils/notifier');

/**
 * Admin: list complaints (with filters)
 */
exports.listComplaints = async (req, res, next) => {
  try {
    const { status, category, assignedTo, page = 1, limit = 50 } = req.query;
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;
    if (assignedTo) q.assignedTo = assignedTo;

    const skip = (Number(page) - 1) * Number(limit);
    const complaints = await Complaint.find(q).populate('createdBy', 'name email').populate('assignedTo', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, resolutionPhotos } = req.body;
    if (!['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (resolutionPhotos && Array.isArray(resolutionPhotos)) complaint.resolutionPhotos = complaint.resolutionPhotos.concat(resolutionPhotos);
    await complaint.save();

    // Notify complaint creator
    await notifyUser(complaint.createdBy, {
      title: `Complaint "${complaint.title}" status updated`,
      message: `Status changed to ${status}.`,
      html: `<p>Your complaint <strong>${complaint.title}</strong> has been updated to <strong>${status}</strong>.</p>`
    });

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

exports.assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body; // user id of authority/officer
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const user = await User.findById(assignedTo);
    if (!user) return res.status(404).json({ message: 'Assigned user not found' });

    complaint.assignedTo = user._id;
    complaint.status = complaint.status === 'Pending' ? 'In Progress' : complaint.status;
    await complaint.save();

    // notify assignee
    await notifyUser(user._id, {
      title: `New assignment: ${complaint.title}`,
      message: `You have been assigned complaint ID ${complaint._id}.`
    });

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params; // complaint id
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.comments.push({ by: req.user._id, message });
    await complaint.save();

    // notify owner about new comment
    await notifyUser(complaint.createdBy, {
      title: `Comment on your complaint "${complaint.title}"`,
      message: message
    });

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};
