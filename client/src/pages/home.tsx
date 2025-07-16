import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Wallet, ArrowRightLeft, Smartphone, Shield } from "lucide-react";

interface HomeProps {
  onSectionChange: (section: string) => void;
}

export function Home({ onSectionChange }: HomeProps) {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Crypto to UPI <span className="text-blue-500">Made Simple</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Seamlessly pay using cryptocurrencies across multiple blockchains or convert to INR via UPI QR codes in real-time.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={() => onSectionChange("qr-scanner")}
            className="gradient-primary hover:opacity-90 text-white px-8 py-4 shadow-lg hover:shadow-xl"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Scan QR Code
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onSectionChange("wallet-connect")}
            className="px-8 py-4 border-slate-300 hover:border-slate-400"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <ArrowRightLeft className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Multi-Chain Support</h3>
              <p className="text-slate-600 text-sm">Ethereum, Polygon, BSC, and Flow blockchain integration</p>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Smartphone className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">UPI Integration</h3>
              <p className="text-slate-600 text-sm">Direct payments to Indian merchants via UPI QR codes</p>
            </CardContent>
          </Card>
          
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Secure & Fast</h3>
              <p className="text-slate-600 text-sm">Real-time conversion with enterprise-grade security</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
