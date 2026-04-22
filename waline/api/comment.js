// Waline serverless entry for Vercel.
// All routes (/api/comment, /api/article, /api/user, ...) are handled by this
// single export; Vercel rewrites them via vercel.json below.
module.exports = require('@waline/vercel');
