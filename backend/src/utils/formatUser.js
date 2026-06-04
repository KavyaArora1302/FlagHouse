import { formatSavedAddress } from './savedAddress.js';

export const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role || 'user',
  savedAddresses: (user.savedAddresses || []).map(formatSavedAddress),
});
