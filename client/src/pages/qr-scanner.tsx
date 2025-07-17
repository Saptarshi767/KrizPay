import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Camera, ArrowRight, Info, ArrowLeft } from "lucide-react";
import { parseQRCode, validateQRInput } from "@/lib/qr-utils";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface QRScannerProps {
  onSectionChange: (section: string) => void;
  onQRProcessed: (data: any) => void;
}

export function QRScanner({ onSectionChange, onQRProcessed }: QRScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader | null = null;
    if (videoRef.current) {
      codeReader = new BrowserMultiFormatReader();
      setScanning(true);
      codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            const scannedValue = result.getText();
            setManualInput(scannedValue);
            setScanning(false);
            codeReader?.stopContinuousDecode(); // stop scanning after a result
            // Always parse and pass the parsed result
            const parsed = parseQRCode(scannedValue);
            onQRProcessed(parsed);
          }
          if (err && !(err.name === 'NotFoundException')) {
            setCameraError(err.message || 'Camera error');
          }
        }
      ).catch((err) => {
        setCameraError(err.message || 'Camera error');
        setScanning(false);
      });
    }
    return () => {
      if (codeReader && typeof codeReader.stopContinuousDecode === "function") {
        codeReader.stopContinuousDecode();
      }
      setScanning(false);
    };
  }, []);

  const handleManualInput = useCallback((value: string) => {
    setManualInput(value);
    setError("");
  }, []);

  const processQRCode = useCallback(async () => {
    if (!manualInput.trim()) {
      setError("Please enter a QR code or address");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const validation = validateQRInput(manualInput);
      
      if (!validation.isValid) {
        setError(validation.error || "Invalid QR code format");
        return;
      }

      const parsed = parseQRCode(manualInput);
      onQRProcessed(parsed);

      // Navigate to appropriate section
      if (parsed.type === "upi") {
        onSectionChange("upi-payment");
      } else if (parsed.type === "address") {
        onSectionChange("payment-form");
      }
    } catch (error) {
      setError("Failed to process QR code");
    } finally {
      setIsProcessing(false);
    }
  }, [manualInput, onQRProcessed, onSectionChange]);

  return (
    <section className="py-8">
      <div className="max-w-sm mx-auto px-4">
        <Card className="shadow-xl border-slate-200">
          <div className="gradient-emerald p-4 text-white text-center">
            <QrCode className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-lg font-semibold">Scan QR Code</h2>
            <p className="text-emerald-100 text-sm">Point camera at UPI or crypto QR</p>
          </div>
          
          <CardContent className="p-0">
            {/* Camera View */}
            <div className="relative bg-black aspect-square">
              <video ref={videoRef} className="w-full h-full object-cover rounded-xl" autoPlay muted playsInline />
              <div className="absolute inset-4 border-2 border-white rounded-xl opacity-50"></div>
              {/* Scanning line animation */}
              <div className="scan-line"></div>
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-red-400 bg-black bg-opacity-70 p-2 rounded">{cameraError}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Position QR code within the frame
                </AlertDescription>
              </Alert>
              
              {/* Manual input fallback */}
              <div className="space-y-2">
                <Label htmlFor="manual-input" className="text-xs font-medium text-slate-700">
                  Or enter manually:
                </Label>
                <Input
                  id="manual-input"
                  placeholder="upi://pay?pa=merchant@ybl or 0x742d..."
                  value={manualInput}
                  onChange={(e) => handleManualInput(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={processQRCode}
                  disabled={isProcessing || !manualInput.trim()}
                  className="w-full gradient-emerald hover:opacity-90 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Process Code
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => onSectionChange("home")}
                  className="w-full text-slate-600 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
