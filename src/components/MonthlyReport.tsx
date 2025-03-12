
import React, { useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Separator } from "@/components/ui/separator";
import { Download, DollarSign, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

// Define the commission rate
const COMMISSION_RATE = 0.05; // 5% commission


const MonthlyReport: React.FC = () => {
  const { orders, products } = useOrder();
  const { t, i18n } = useTranslation("global");
  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCommission: 0,
    productSales: [] as Array<{
      name: string;
      sales: number;
      quantity: number;
      color: string;
    }>,
    salesByDay: [] as Array<{
      date: string;
      sales: number;
    }>
  });

  // Generate report data
  useEffect(() => {
    // Get current month orders
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear &&
             order.status !== "cancelled";
    });
    
    // Calculate total sales and order count
    const totalSales = currentMonthOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = currentMonthOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalCommission = totalSales * COMMISSION_RATE;
    
    // Calculate sales by product
    const productSalesMap = new Map<string, { sales: number, quantity: number }>();
    
    currentMonthOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const sales = item.quantity * item.unitPrice;
          
          if (productSalesMap.has(product.id)) {
            const existing = productSalesMap.get(product.id)!;
            productSalesMap.set(product.id, {
              sales: existing.sales + sales,
              quantity: existing.quantity + item.quantity
            });
          } else {
            productSalesMap.set(product.id, { sales, quantity: item.quantity });
          }
        }
      });
    });
    
    // Convert to array and sort by sales
    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"];
    
    const productSales = Array.from(productSalesMap.entries())
      .map(([productId, { sales, quantity }], index) => {
        const product = products.find(p => p.id === productId);
        return {
          name: product ? product.name : "Unknown",
          sales,
          quantity,
          color: colors[index % colors.length]
        };
      })
      .sort((a, b) => b.sales - a.sales);
    
    // Group sales by day for the current month
    const salesByDay = new Map<string, number>();
    
    // Initialize all days in the month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${i}/${currentMonth + 1}`;
      salesByDay.set(dateStr, 0);
    }
    
    // Populate sales by day
    currentMonthOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dateStr = `${orderDate.getDate()}/${orderDate.getMonth() + 1}`;
      
      if (salesByDay.has(dateStr)) {
        salesByDay.set(dateStr, salesByDay.get(dateStr)! + order.total);
      } else {
        salesByDay.set(dateStr, order.total);
      }
    });
    
    // Convert to array and sort by date
    const salesByDayArray = Array.from(salesByDay.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => {
        // Sort by day number
        const dayA = parseInt(a.date.split('/')[0]);
        const dayB = parseInt(b.date.split('/')[0]);
        return dayA - dayB;
      });
    
    setReportData({
      totalSales,
      totalOrders,
      avgOrderValue,
      totalCommission,
      productSales,
      salesByDay: salesByDayArray
    });
  }, [orders, products]);

  // Function to generate and download PDF report
  const downloadReport = () => {
    // In a real application, this would generate a PDF using a library like jsPDF
    // For this example, we'll simulate it by creating a CSV file

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    let csvContent = `Monthly Sales Report - ${currentMonth} ${currentYear}\n\n`;
    csvContent += `Total Sales: $${reportData.totalSales.toFixed(2)}\n`;
    csvContent += `Total Orders: ${reportData.totalOrders}\n`;
    csvContent += `Average Order Value: $${reportData.avgOrderValue.toFixed(2)}\n`;
    csvContent += `Total Commission (${COMMISSION_RATE * 100}%): $${reportData.totalCommission.toFixed(2)}\n\n`;
    
    csvContent += `Product Sales:\n`;
    csvContent += `Product,Quantity,Sales\n`;
    reportData.productSales.forEach(product => {
      csvContent += `${product.name},${product.quantity.toFixed(2)},$${product.sales.toFixed(2)}\n`;
    });
    
    csvContent += `\nDaily Sales:\n`;
    csvContent += `Date,Sales\n`;
    reportData.salesByDay.forEach(day => {
      csvContent += `${day.date},$${day.sales.toFixed(2)}\n`;
    });
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${currentMonth.toLowerCase()}-${currentYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
        <CardTitle>{t("report.monthly_sales_report")}</CardTitle>
        <CardDescription>
          {new Date().toLocaleString(i18n.language, { month: "long", year: "numeric" })}
        </CardDescription>
        </div>
        <Button onClick={downloadReport} className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          {t("report.download_report")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("report.total_sales")}</p>
                  <h3 className="text-2xl font-bold">${reportData.totalSales.toFixed(2)}</h3>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
              {t("report.from_orders", { count: reportData.totalOrders })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-muted-foreground">{t("report.average_order_value")}</p>
                  <h3 className="text-2xl font-bold">${reportData.avgOrderValue.toFixed(2)}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t("report.per_order_average")}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-muted-foreground">{t("report.your_commission")}</p>
                  <h3 className="text-2xl font-bold">${reportData.totalCommission.toFixed(2)}</h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
              {t("report.based_on_commission_rate", { rate: COMMISSION_RATE * 100 })}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <div>
          <h3 className="text-lg font-medium mb-3">{t("report.sales_by_product")}</h3>
          <div className="h-80">
              {reportData.productSales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.productSales} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, t("report.sales")]}
                      labelFormatter={(label) => `${t("report.product")}: ${label}`}
                    />
                    <Bar dataKey="sales" name={t("report.sales")}>
                      {reportData.productSales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t("report.no_sales_data")}
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">{t("report.daily_sales_trend")}</h3>
            <div className="h-80">
              {reportData.salesByDay.some(day => day.sales > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, t("report.sales")]}
                      labelFormatter={(label) => `${t("report.date")}: ${label}`}
                    />
                    <Bar dataKey="sales" fill="#8884d8" name={t("report.sales")} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t("report.no_daily_sales_data")}
                </div>
              )}
            </div>
          </div>

          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">{t("report.product_sales_details")}</h3>
            {reportData.productSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t("report.product")}</th>
                      <th className="text-right py-2">{t("report.quantity")}</th>
                      <th className="text-right py-2">{t("report.sales_amount")}</th>
                      <th className="text-right py-2">{t("report.percentage_of_total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.productSales.map((product, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{product.name}</td>
                        <td className="text-right py-2">{product.quantity.toFixed(2)}</td>
                        <td className="text-right py-2">${product.sales.toFixed(2)}</td>
                        <td className="text-right py-2">
                          {reportData.totalSales > 0
                            ? ((product.sales / reportData.totalSales) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td className="py-2">{t("report.total")}</td>
                      <td className="text-right py-2">
                        {reportData.productSales.reduce((sum, p) => sum + p.quantity, 0).toFixed(2)}
                      </td>
                      <td className="text-right py-2">${reportData.totalSales.toFixed(2)}</td>
                      <td className="text-right py-2">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {t("report.no_product_sales_data")}
              </div>
            )}
          </div>
          <div className="bg-muted p-4 rounded-md mt-6">
            <h3 className="text-lg font-medium mb-2">{t("report.monthly_summary")}</h3>
            <p className="text-muted-foreground">
              {t("report.achieved_sales", {
                month: new Date().toLocaleString(i18n.language, { month: "long", year: "numeric" }),
                total_sales: `$${reportData.totalSales.toFixed(2)}`,
                total_orders: reportData.totalOrders
              })}{" "}
              {t("report.earned_commission", {
                commission: `$${reportData.totalCommission.toFixed(2)}`,
                rate: COMMISSION_RATE * 100
              })}

              {reportData.productSales.length > 0 && (
                <>
                  <br />
                  <br />
                  {t("report.top_selling_product", {
                    top_product: reportData.productSales[0]?.name,
                    top_sales: `$${reportData.productSales[0]?.sales.toFixed(2)}`,
                    percentage:
                      reportData.totalSales > 0
                        ? ((reportData.productSales[0]?.sales / reportData.totalSales) * 100).toFixed(1)
                        : 0
                  })}
                </>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyReport;
