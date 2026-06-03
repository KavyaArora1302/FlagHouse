/** First CLIENT_URL origin — used for links in emails */
export const getClientBaseUrl = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5174';
  return raw.split(',')[0].trim().replace(/\/$/, '');
};
