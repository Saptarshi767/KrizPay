import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Chrome, Download, ExternalLink, AlertTriangle } from "lucide-react";

export function MetaMaskInstaller() {
  const installMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <Card className="shadow-xl border-orange-200">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white text-center">
        <Chrome className="w-12 h-12 mx-auto mb-2" />
        <h2 className="text-xl font-semibold">MetaMask Required</h2>
        <p className="text-orange-100 text-sm">Install MetaMask to use KrizPay</p>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            MetaMask is a crypto wallet browser extension that allows you to interact with blockchain applications safely.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 mb-2">How to Install:</h3>
            <div className="text-sm text-slate-600 space-y-2 text-left">
              <div className="flex items-start space-x-2">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Click "Install MetaMask" below</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Choose your browser and install the extension</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <span>Create or import your wallet</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <span>Return to KrizPay and refresh this page</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={installMetaMask}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Install MetaMask
            </Button>
            
            <Button
              variant="outline"
              onClick={refreshPage}
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              I've Installed MetaMask - Refresh Page
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            <p>MetaMask is a free and secure wallet trusted by millions of users worldwide.</p>
            <p className="mt-1">Your funds are always under your control.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}