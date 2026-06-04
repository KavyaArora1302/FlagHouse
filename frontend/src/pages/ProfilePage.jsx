import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultSavedAddress,
} from '../api/profile';

const emptyAddress = {
  label: 'Home',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

const AddressForm = ({ initial, onSubmit, onCancel, submitting, submitLabel }) => {
  const [form, setForm] = useState(initial);
  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      isDefault: Boolean(form.isDefault),
    });
  };

  const fieldClass =
    'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 border border-gray-100 rounded-xl p-5 bg-gray-50/50">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Label</label>
        <input
          type="text"
          value={form.label}
          onChange={set('label')}
          placeholder="Home, Office..."
          className={fieldClass}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
          <input type="text" required value={form.firstName} onChange={set('firstName')} className={fieldClass} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
          <input type="text" required value={form.lastName} onChange={set('lastName')} className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
        <input type="tel" required value={form.phone} onChange={set('phone')} className={fieldClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Street address</label>
        <input type="text" required value={form.address} onChange={set('address')} className={fieldClass} />
      </div>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
          <input type="text" required value={form.city} onChange={set('city')} className={fieldClass} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
          <input type="text" required value={form.state} onChange={set('state')} className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
        <input type="text" required value={form.pincode} onChange={set('pincode')} className={fieldClass} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(form.isDefault)}
          onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
          className="rounded border-gray-300"
        />
        Set as default address
      </label>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-black text-white font-semibold py-2.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

const ProfilePage = () => {
  const { user, token, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [addressMode, setAddressMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [addressSaving, setAddressSaving] = useState(false);

  const addresses = user?.savedAddresses || [];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');

    if (!name.trim()) {
      setProfileError('Name is required');
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(token, { name: name.trim() });
      await refreshUser();
      setProfileMsg('Profile updated');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveAddress = async (data) => {
    setAddressError('');
    setAddressSaving(true);
    try {
      if (editingId) {
        await updateSavedAddress(token, editingId, data);
      } else {
        await addSavedAddress(token, data);
      }
      await refreshUser();
      setAddressMode(null);
      setEditingId(null);
    } catch (err) {
      setAddressError(err.message || 'Failed to save address');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    setAddressError('');
    try {
      await deleteSavedAddress(token, id);
      await refreshUser();
    } catch (err) {
      setAddressError(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    setAddressError('');
    try {
      await setDefaultSavedAddress(token, id);
      await refreshUser();
    } catch (err) {
      setAddressError(err.message || 'Failed to update default address');
    }
  };

  const startEdit = (addr) => {
    setEditingId(addr.id);
    setAddressMode('form');
  };

  const editingAddress = editingId
    ? addresses.find((a) => a.id === editingId)
    : null;

  return (
    <div className="w-full px-8 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-base text-gray-500">
          Update your account and saved delivery addresses for faster checkout
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-2xl">
        <section className="bg-white border border-gray-100 rounded-2xl p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Account</h2>
          <p className="text-sm text-gray-500 mb-6">{user?.email}</p>

          {profileError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {profileError}
            </div>
          )}
          {profileMsg && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="self-start bg-black text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              {profileSaving ? 'Saving…' : 'Save name'}
            </button>
          </form>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Saved addresses</h2>
              <p className="text-sm text-gray-500">Used to pre-fill checkout (up to 5)</p>
            </div>
            {addressMode !== 'form' && addresses.length < 5 && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setAddressMode('form');
                }}
                className="text-sm font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                + Add address
              </button>
            )}
          </div>

          {addressError && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {addressError}
            </div>
          )}

          {addressMode === 'form' && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {editingId ? 'Edit address' : 'New address'}
              </h3>
              <AddressForm
                initial={
                  editingAddress
                    ? { ...editingAddress, isDefault: editingAddress.isDefault }
                    : { ...emptyAddress, isDefault: addresses.length === 0 }
                }
                onSubmit={handleSaveAddress}
                onCancel={() => {
                  setAddressMode(null);
                  setEditingId(null);
                  setAddressError('');
                }}
                submitting={addressSaving}
                submitLabel={editingId ? 'Update address' : 'Save address'}
              />
            </div>
          )}

          {addresses.length === 0 && addressMode !== 'form' && (
            <p className="text-sm text-gray-500 py-4">
              No saved addresses yet. Add one here or they will be filled from your last order at checkout.
            </p>
          )}

          <ul className="flex flex-col gap-4">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs font-medium bg-gray-900 text-white px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {addr.firstName} {addr.lastName}
                    <br />
                    {addr.address}
                    <br />
                    {addr.city}, {addr.state} – {addr.pincode}
                    <br />
                    {addr.phone}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(addr)}
                    className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs font-medium text-red-600 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-gray-500">
          <Link to="/orders" className="text-gray-900 font-medium underline hover:no-underline">
            View your orders
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
