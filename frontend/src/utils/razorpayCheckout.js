const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = async ({
  keyId,
  amount,
  currency,
  orderId,
  orderNumber,
  customer,
  onSuccess,
  onDismiss,
}) => {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: 'FlagHouse',
      description: `Order ${orderNumber}`,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: '#000000' },
      handler: async (response) => {
        try {
          const result = await onSuccess(response);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
          reject(new Error('Payment cancelled'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      reject(
        new Error(response.error?.description || 'Payment failed. Please try again.')
      );
    });
    rzp.open();
  });
};
