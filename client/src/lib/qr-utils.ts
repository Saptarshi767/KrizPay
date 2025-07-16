export function parseQRCode(qrData: string): { type: 'upi' | 'address' | 'unknown'; data: any } {
  if (!qrData) return { type: 'unknown', data: null };

  // Check if it's a UPI QR code
  if (qrData.startsWith('upi://')) {
    const url = new URL(qrData);
    const params = new URLSearchParams(url.search);
    
    return {
      type: 'upi',
      data: {
        vpa: params.get('pa'),
        payeeName: params.get('pn'),
        amount: params.get('am'),
        transactionNote: params.get('tn'),
        transactionRef: params.get('tr'),
        currency: params.get('cu') || 'INR',
      }
    };
  }

  // Check if it's a crypto address
  if (qrData.startsWith('0x') && qrData.length === 42) {
    return {
      type: 'address',
      data: {
        address: qrData,
        network: 'ethereum', // Default to Ethereum
      }
    };
  }

  // Check for other address formats
  if (qrData.length >= 26 && qrData.length <= 35) {
    return {
      type: 'address',
      data: {
        address: qrData,
        network: 'unknown',
      }
    };
  }

  return { type: 'unknown', data: null };
}

export function generateUPIQRData(vpa: string, amount: string, transactionId: string, payeeName = 'KrizPay'): string {
  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amount,
    cu: 'INR',
    tr: transactionId,
  });

  return `upi://pay?${params.toString()}`;
}

export function validateQRInput(input: string): { isValid: boolean; type: 'upi' | 'address' | null; error?: string } {
  if (!input.trim()) {
    return { isValid: false, type: null, error: 'Please enter a valid QR code or address' };
  }

  const parsed = parseQRCode(input);
  
  if (parsed.type === 'upi') {
    if (!parsed.data.vpa) {
      return { isValid: false, type: 'upi', error: 'Invalid UPI QR code' };
    }
    return { isValid: true, type: 'upi' };
  }

  if (parsed.type === 'address') {
    if (!parsed.data.address) {
      return { isValid: false, type: 'address', error: 'Invalid address format' };
    }
    return { isValid: true, type: 'address' };
  }

  return { isValid: false, type: null, error: 'Unsupported QR code format' };
}
