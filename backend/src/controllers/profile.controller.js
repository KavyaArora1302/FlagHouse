import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { formatUser } from '../utils/formatUser.js';
import {
  formatSavedAddress,
  validateSavedAddressInput,
  shippingFromSaved,
} from '../utils/savedAddress.js';

const MAX_SAVED_ADDRESSES = 5;

const findAddressSubdoc = (user, addressId) =>
  user.savedAddresses.id(addressId);

const clearDefaultAddresses = (user) => {
  user.savedAddresses.forEach((addr) => {
    addr.isDefault = false;
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    req.user.name = name.trim();
    await req.user.save();

    res.json({ user: formatUser(req.user) });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const addSavedAddress = async (req, res) => {
  try {
    const { error, data } = validateSavedAddressInput(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    if (req.user.savedAddresses.length >= MAX_SAVED_ADDRESSES) {
      return res.status(400).json({
        message: `You can save up to ${MAX_SAVED_ADDRESSES} addresses`,
      });
    }

    const makeDefault =
      data.isDefault || req.user.savedAddresses.length === 0;

    if (makeDefault) {
      clearDefaultAddresses(req.user);
    }

    req.user.savedAddresses.push({
      ...data,
      isDefault: makeDefault,
    });

    await req.user.save();

    res.status(201).json({ user: formatUser(req.user) });
  } catch (error) {
    console.error('addSavedAddress error:', error);
    res.status(500).json({ message: 'Failed to save address' });
  }
};

export const updateSavedAddress = async (req, res) => {
  try {
    const subdoc = findAddressSubdoc(req.user, req.params.id);

    if (!subdoc) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const { error, data } = validateSavedAddressInput(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    if (data.isDefault) {
      clearDefaultAddresses(req.user);
    }

    subdoc.label = data.label;
    subdoc.firstName = data.firstName;
    subdoc.lastName = data.lastName;
    subdoc.phone = data.phone;
    subdoc.address = data.address;
    subdoc.city = data.city;
    subdoc.state = data.state;
    subdoc.pincode = data.pincode;

    if (data.isDefault) {
      subdoc.isDefault = true;
    }

    await req.user.save();

    res.json({ user: formatUser(req.user) });
  } catch (error) {
    console.error('updateSavedAddress error:', error);
    res.status(500).json({ message: 'Failed to update address' });
  }
};

export const deleteSavedAddress = async (req, res) => {
  try {
    const subdoc = findAddressSubdoc(req.user, req.params.id);

    if (!subdoc) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = subdoc.isDefault;
    subdoc.deleteOne();

    if (wasDefault && req.user.savedAddresses.length > 0) {
      req.user.savedAddresses[0].isDefault = true;
    }

    await req.user.save();

    res.json({ user: formatUser(req.user) });
  } catch (error) {
    console.error('deleteSavedAddress error:', error);
    res.status(500).json({ message: 'Failed to delete address' });
  }
};

export const setDefaultSavedAddress = async (req, res) => {
  try {
    const subdoc = findAddressSubdoc(req.user, req.params.id);

    if (!subdoc) {
      return res.status(404).json({ message: 'Address not found' });
    }

    clearDefaultAddresses(req.user);
    subdoc.isDefault = true;
    await req.user.save();

    res.json({ user: formatUser(req.user) });
  } catch (error) {
    console.error('setDefaultSavedAddress error:', error);
    res.status(500).json({ message: 'Failed to set default address' });
  }
};

export const getCheckoutPrefill = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const savedAddresses = user.savedAddresses.map(formatSavedAddress);
    const defaultSaved =
      user.savedAddresses.find((a) => a.isDefault) || user.savedAddresses[0];

    if (defaultSaved) {
      return res.json({
        source: 'saved',
        addressId: defaultSaved._id.toString(),
        shippingAddress: shippingFromSaved(defaultSaved, user.email),
        savedAddresses,
      });
    }

    const lastOrder = await Order.findOne({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (lastOrder?.shippingAddress) {
      return res.json({
        source: 'lastOrder',
        shippingAddress: lastOrder.shippingAddress,
        savedAddresses,
      });
    }

    const nameParts = user.name.trim().split(/\s+/);

    res.json({
      source: 'account',
      shippingAddress: {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      },
      savedAddresses,
    });
  } catch (error) {
    console.error('getCheckoutPrefill error:', error);
    res.status(500).json({ message: 'Failed to load checkout details' });
  }
};
