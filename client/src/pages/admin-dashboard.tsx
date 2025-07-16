import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ArrowRightLeft, 
  CheckCircle, 
  Users,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { formatAddress } from "@/lib/wallet-utils";

interface AdminDashboardProps {
  onSectionChange: (section: string) => void;
}

export function AdminDashboard({ onSectionChange }: AdminDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600">{title}</div>
            <div className="text-2xl font-bold text-slate-800">
              {statsLoading ? <Skeleton className="h-8 w-20" /> : value}
            </div>
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="text-xs text-emerald-600 mt-2">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500";
      case "pending":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "pending":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case "failed":
        return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      default:
        return <div className="w-4 h-4 bg-slate-500 rounded-full" />;
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
              <p className="text-slate-600">Monitor payments and system health</p>
            </div>
            <Button
              variant="outline"
              onClick={() => onSectionChange("home")}
              className="border-slate-300 hover:border-slate-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Volume"
            value={stats ? `₹${parseFloat(stats.totalVolume).toLocaleString('en-IN')}` : "₹0"}
            icon={TrendingUp}
            trend="+12.5% from last month"
            color="bg-blue-500"
          />
          <StatCard
            title="Transactions"
            value={stats?.transactions || 0}
            icon={ArrowRightLeft}
            trend="+8.3% from last month"
            color="bg-emerald-500"
          />
          <StatCard
            title="Success Rate"
            value={stats ? `${stats.successRate}%` : "0%"}
            icon={CheckCircle}
            trend="+0.2% from last month"
            color="bg-purple-500"
          />
          <StatCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon={Users}
            trend="+15.7% from last month"
            color="bg-amber-500"
          />
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transactionsLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${getStatusColor(transaction.status)} rounded-full flex items-center justify-center`}>
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {formatAddress(transaction.fromAddress)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-800">
                          {transaction.inrValue ? `₹${parseFloat(transaction.inrValue).toLocaleString('en-IN')}` : 'N/A'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {transaction.amount} {transaction.token.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <ArrowRightLeft className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Ethereum Network</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Polygon Network</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-700">UPI Gateway</span>
                </div>
                <Badge className="bg-amber-100 text-amber-800">Degraded</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Price Feeds</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Online</Badge>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="text-sm text-slate-600 mb-2">Liquidity Pool</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">ETH</span>
                    <span className="text-xs font-medium">12.45 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">MATIC</span>
                    <span className="text-xs font-medium">5,420 MATIC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">INR</span>
                    <span className="text-xs font-medium">₹8,45,230</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
