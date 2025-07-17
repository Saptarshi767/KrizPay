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

  // Check for EIP-681 or similar format (e.g., ethereum:0x1234...?value=0.01&token=sepoliaETH)
  if (qrData.startsWith('ethereum:')) {
    try {
      const [addressPart, queryString] = qrData.replace('ethereum:', '').split('?');
      const params = new URLSearchParams(queryString || '');
      let amount = '';
      if (params.get('value')) {
        // Convert from wei to ETH for display
        amount = (Number(params.get('value')) / 1e18).toString();
      }
      return {
        type: 'address',
        data: {
          address: addressPart,
          amount,
          token: params.get('token') || 'eth',
          network: 'ethereum',
        }
      };
    } catch {
      // fallback to unknown
    }
  }

  // Handle QR codes like 0x...@0x... (address@chainId)
  const atIdx = qrData.indexOf('@0x');
  if (qrData.startsWith('0x') && atIdx > 0) {
    return {
      type: 'address',
      data: {
        address: qrData.slice(0, atIdx),
        chainId: qrData.slice(atIdx + 1),
        network: 'ethereum', // or map chainId to network name if needed
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

export function generateMetaMaskQR(address: string, ethAmount: string) {
  // Convert ETH to wei
  const wei = BigInt(Number(ethAmount) * 1e18).toString();
  return `ethereum:${address}?value=${wei}`;
}
