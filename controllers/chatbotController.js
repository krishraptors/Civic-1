const Complaint = require('../models/Complaint');

// import { GoogleGenAI } from "@google/genai";

const GoogleGenAI = require("@google/genai").GoogleGenAI;

/**
 * Simple rule-based chatbot endpoint.
 * POST /api/chatbot/query
 * body: { q: "What's the status of my complaint 64a..." }
 *
 * It tries to detect a complaint id (ObjectId), or email + title words, or asks for help.
 */
exports.query = async (req, res, next) => {
  try {
    const { q } = req.body;
    if (!q) return res.status(400).json({ message: 'Query text required in "q"' });

    // Try to find an ObjectId inside q
    const idMatch = q.match(/[0-9a-fA-F]{24}/);
    if (idMatch) {
      const complaint = await Complaint.findById(idMatch[0]).populate('createdBy', 'name email');
      if (!complaint) return res.json({ reply: `I couldn't find a complaint with id ${idMatch[0]}.` });
      return res.json({
        reply: `Complaint "${complaint.title}" is currently "${complaint.status}". Created on ${complaint.createdAt.toDateString()}.`,
        complaint
      });
    }

    // Look for keywords like "status" and "my complaint" and try to find most recent complaint of the user (if authenticated)
    if (/(status|where|progress)/i.test(q) && req.user) {
      const complaint = await Complaint.findOne({ createdBy: req.user._id }).sort({ createdAt: -1 });
      if (!complaint) return res.json({ reply: "I couldn't find any complaints by you." });
      return res.json({ reply: `Your most recent complaint "${complaint.title}" is "${complaint.status}".`, complaint });
    }

    // Generic responses
    if (/how to report|report a (complaint|issue)/i.test(q)) {
      return res.json({ reply: 'To report an issue, go to /api/complaints (POST). Provide a title, description, category, location (latitude+longitude or address) and optionally photos. You must be authenticated.' });
    }

    const geminiResponse = await gemini(q);
    return res.json({ reply: geminiResponse });

    // return res.json({ reply: "Sorry, I didn't understand. You can ask: 'What's the status of my complaint <complaint-id>' or 'How to report an issue'." });
  } catch (err) {
    next(err);
  }
};













const ai = new GoogleGenAI({});

async function gemini(q) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Only answer the question if it is related to civic issues. Just repond with 'I am not supposed to answer that', otherwise. Answer the user's query in a concise manner.\nUser query: " + q,
  });
  console.log(response.text);
  return response.text;
}

// await gemini();