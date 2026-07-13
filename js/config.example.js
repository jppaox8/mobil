// Runtime configuration for Arabella Chic.
// Copy this file to js/config.js and fill in real values.
// js/config.js is git-ignored so secrets are never committed to the repository.
window.ARABELLA_CONFIG = {
  // Make.com (or any) webhook that receives contact-form submissions.
  // NOTE: because this is a fully client-side site, whatever URL you put here
  // is visible to anyone who opens the page. Treat it as a public, abusable
  // endpoint: add validation/rate-limiting on the receiving side and rotate it
  // if it is ever leaked.
  contactWebhookUrl: 'https://hook.example.com/your-webhook-id'
};
