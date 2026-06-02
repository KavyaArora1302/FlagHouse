const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'cod'];

export const validateShippingAddress = (address) => {
  const required = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'pincode',
  ];

  for (const field of required) {
    if (!address?.[field]?.trim()) {
      return `Missing required field: ${field}`;
    }
  }

  return null;
};

export const normalizeOrderPayload = (body) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    subtotal,
    shipping,
    codCharge = 0,
    total,
  } = body;

  if (!items?.length) {
    return { error: 'Cart is empty' };
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: 'Invalid payment method' };
  }

  const addressError = validateShippingAddress(shippingAddress);
  if (addressError) {
    return { error: addressError };
  }

  if (
    typeof subtotal !== 'number' ||
    typeof shipping !== 'number' ||
    typeof total !== 'number'
  ) {
    return { error: 'Invalid order totals' };
  }

  const normalizedItems = items.map((item) => ({
    productId: item.productId ?? item.id,
    name: item.name,
    category: item.category,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
  }));

  return {
    data: {
      items: normalizedItems,
      shippingAddress: {
        firstName: shippingAddress.firstName.trim(),
        lastName: shippingAddress.lastName.trim(),
        email: shippingAddress.email.trim().toLowerCase(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      paymentMethod,
      subtotal,
      shipping,
      codCharge: codCharge || 0,
      total,
    },
  };
};
