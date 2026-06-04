const ADDRESS_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'address',
  'city',
  'state',
  'pincode',
];

export const formatSavedAddress = (address) => ({
  id: address._id.toString(),
  label: address.label || 'Home',
  firstName: address.firstName,
  lastName: address.lastName,
  phone: address.phone,
  address: address.address,
  city: address.city,
  state: address.state,
  pincode: address.pincode,
  isDefault: Boolean(address.isDefault),
});

export const validateSavedAddressInput = (body) => {
  const data = {};

  for (const field of ADDRESS_FIELDS) {
    const value = body?.[field]?.trim();
    if (!value) {
      return { error: `Missing required field: ${field}` };
    }
    data[field] = value;
  }

  const label = body?.label?.trim();
  data.label = label || 'Home';
  data.isDefault = Boolean(body?.isDefault);

  return { data };
};

export const shippingFromSaved = (saved, email) => ({
  firstName: saved.firstName,
  lastName: saved.lastName,
  email,
  phone: saved.phone,
  address: saved.address,
  city: saved.city,
  state: saved.state,
  pincode: saved.pincode,
});
