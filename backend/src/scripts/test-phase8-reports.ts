/**
 * Test Phase 8: Financial Reports
 *
 * This script tests all report endpoints:
 * - Sales Reports (summary, detail, by customer, by item, trend)
 * - Purchase Reports (summary, detail, by supplier, by item)
 * - Financial Statements (P&L, Balance Sheet, Cash Flow, Trial Balance)
 * - Tax Reports (summary, detail, by rate)
 */

import { PrismaClient } from "../generated/prisma";
import {
  getSalesSummaryReport,
  getSalesDetailReport,
  getSalesByCustomerReport,
  getSalesByItemReport,
  getSalesTrendAnalysis,
} from "../services/salesReport.service";
import {
  getPurchaseSummaryReport,
  getPurchaseDetailReport,
  getPurchaseBySupplierReport,
  getPurchaseByItemReport,
} from "../services/purchaseReport.service";
import {
  getProfitLossReport,
  getBalanceSheetReport,
  getCashFlowReport,
  getTrialBalanceReport,
} from "../services/financialReport.service";
import {
  getTaxSummaryReport,
  getTaxDetailReport,
  getTaxByRateReport,
} from "../services/taxReport.service";

const prisma = new PrismaClient();

async function testPhase8Reports() {
  console.log("🧪 Testing Phase 8: Financial Reports...\n");

  try {
    // Get or create test tenant
    let tenant = await prisma.tenant.findFirst({
      where: { code: "TEST" },
    });

    if (!tenant) {
      console.log("Creating test tenant...");
      tenant = await prisma.tenant.create({
        data: {
          code: "TEST",
          name: "Test Tenant",
          status: "ACTIVE",
        },
      });
    }

    const tenantId = tenant.id;
    console.log(`✅ Using tenant: ${tenant.code} (${tenantId})\n`);

    // Set tenant context for RLS
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}'`);

    // Test 1: Sales Summary Report
    console.log("Test 1: Sales Summary Report...");
    const salesSummary = await getSalesSummaryReport(tenantId, {
      groupBy: "month",
    });
    console.log(`✅ Sales Summary Report:`);
    console.log(`   Periods: ${salesSummary.periods.length}`);
    console.log(`   Total Invoices: ${salesSummary.summary.totalInvoiceCount}`);
    console.log(`   Total Sales: $${salesSummary.summary.totalSales}\n`);

    // Test 2: Sales Detail Report
    console.log("Test 2: Sales Detail Report...");
    const salesDetail = await getSalesDetailReport(tenantId, {
      page: 1,
      limit: 10,
    });
    console.log(`✅ Sales Detail Report:`);
    console.log(`   Invoices: ${salesDetail.invoices.length}`);
    console.log(`   Total: ${salesDetail.pagination.total}\n`);

    // Test 3: Sales by Customer Report
    console.log("Test 3: Sales by Customer Report...");
    const salesByCustomer = await getSalesByCustomerReport(tenantId, {});
    console.log(`✅ Sales by Customer Report:`);
    console.log(`   Customers: ${salesByCustomer.byCustomer.length}`);
    console.log(`   Total Sales: $${salesByCustomer.summary.totalSales}\n`);

    // Test 4: Sales by Item Report
    console.log("Test 4: Sales by Item Report...");
    const salesByItem = await getSalesByItemReport(tenantId, {});
    console.log(`✅ Sales by Item Report:`);
    console.log(`   Items: ${salesByItem.byItem.length}`);
    console.log(`   Total Sales: $${salesByItem.summary.totalSales}\n`);

    // Test 5: Sales Trend Analysis
    console.log("Test 5: Sales Trend Analysis...");
    const salesTrend = await getSalesTrendAnalysis(tenantId, {
      groupBy: "month",
      metric: "amount",
    });
    console.log(`✅ Sales Trend Analysis:`);
    console.log(`   Trends: ${salesTrend.trends.length}`);
    console.log(`   Metric: ${salesTrend.metric}\n`);

    // Test 6: Purchase Summary Report
    console.log("Test 6: Purchase Summary Report...");
    const purchaseSummary = await getPurchaseSummaryReport(tenantId, {
      groupBy: "month",
    });
    console.log(`✅ Purchase Summary Report:`);
    console.log(`   Periods: ${purchaseSummary.periods.length}`);
    console.log(`   Total Purchases: $${purchaseSummary.summary.totalPurchases}\n`);

    // Test 7: Purchase Detail Report
    console.log("Test 7: Purchase Detail Report...");
    const purchaseDetail = await getPurchaseDetailReport(tenantId, {
      page: 1,
      limit: 10,
    });
    console.log(`✅ Purchase Detail Report:`);
    console.log(`   Invoices: ${purchaseDetail.invoices.length}`);
    console.log(`   Total: ${purchaseDetail.pagination.total}\n`);

    // Test 8: Purchase by Supplier Report
    console.log("Test 8: Purchase by Supplier Report...");
    const purchaseBySupplier = await getPurchaseBySupplierReport(tenantId, {});
    console.log(`✅ Purchase by Supplier Report:`);
    console.log(`   Suppliers: ${purchaseBySupplier.bySupplier.length}`);
    console.log(`   Total Purchases: $${purchaseBySupplier.summary.totalPurchases}\n`);

    // Test 9: Purchase by Item Report
    console.log("Test 9: Purchase by Item Report...");
    const purchaseByItem = await getPurchaseByItemReport(tenantId, {});
    console.log(`✅ Purchase by Item Report:`);
    console.log(`   Items: ${purchaseByItem.byItem.length}`);
    console.log(`   Total Purchases: $${purchaseByItem.summary.totalPurchases}\n`);

    // Test 10: Profit & Loss Report
    console.log("Test 10: Profit & Loss Report...");
    const profitLoss = await getProfitLossReport(tenantId, {
      groupBy: "month",
      includeDetails: false,
    });
    console.log(`✅ Profit & Loss Report:`);
    console.log(`   Net Revenue: $${profitLoss.summary.netRevenue}`);
    console.log(`   Net Cost of Goods Sold: $${profitLoss.summary.netCostOfGoodsSold}`);
    console.log(`   Gross Profit: $${profitLoss.summary.grossProfit}`);
    console.log(`   Net Profit: $${profitLoss.summary.netProfit}\n`);

    // Test 11: Balance Sheet Report
    console.log("Test 11: Balance Sheet Report...");
    const balanceSheet = await getBalanceSheetReport(tenantId, {
      includeDetails: false,
    });
    console.log(`✅ Balance Sheet Report:`);
    console.log(`   Assets: $${balanceSheet.assets.total}`);
    console.log(`   Liabilities: $${balanceSheet.liabilities.total}`);
    console.log(`   Equity: $${balanceSheet.equity.total}`);
    console.log(`   Balance Check Difference: $${balanceSheet.balanceCheck.difference}\n`);

    // Test 12: Cash Flow Report
    console.log("Test 12: Cash Flow Report...");
    const cashFlow = await getCashFlowReport(tenantId, {
      groupBy: "month",
      includeDetails: false,
    });
    console.log(`✅ Cash Flow Report:`);
    console.log(`   Total Cash Inflows: $${cashFlow.summary.totalCashInflows}`);
    console.log(`   Total Cash Outflows: $${cashFlow.summary.totalCashOutflows}`);
    console.log(`   Net Cash Flow: $${cashFlow.summary.netCashFlow}\n`);

    // Test 13: Trial Balance Report
    console.log("Test 13: Trial Balance Report...");
    const trialBalance = await getTrialBalanceReport(tenantId, {
      includeZeroBalances: false,
    });
    console.log(`✅ Trial Balance Report:`);
    console.log(`   Accounts: ${trialBalance.accounts.length}`);
    console.log(`   Total Debits: $${trialBalance.totals.totalDebits}`);
    console.log(`   Total Credits: $${trialBalance.totals.totalCredits}`);
    console.log(`   Difference: $${trialBalance.totals.difference}\n`);

    // Test 14: Tax Summary Report
    console.log("Test 14: Tax Summary Report...");
    const taxSummary = await getTaxSummaryReport(tenantId, {
      invoiceType: "BOTH",
    });
    console.log(`✅ Tax Summary Report:`);
    console.log(`   Tax Collected: $${taxSummary.summary.taxCollected}`);
    console.log(`   Tax Paid: $${taxSummary.summary.taxPaid}`);
    console.log(`   Net Tax Payable: $${taxSummary.summary.netTaxPayable}\n`);

    // Test 15: Tax Detail Report
    console.log("Test 15: Tax Detail Report...");
    const taxDetail = await getTaxDetailReport(tenantId, {
      invoiceType: "BOTH",
      page: 1,
      limit: 10,
    });
    console.log(`✅ Tax Detail Report:`);
    console.log(`   Sales Invoices: ${taxDetail.salesInvoices.length}`);
    console.log(`   Purchase Invoices: ${taxDetail.purchaseInvoices.length}`);
    console.log(`   Total: ${taxDetail.pagination.total}\n`);

    // Test 16: Tax by Rate Report
    console.log("Test 16: Tax by Rate Report...");
    const taxByRate = await getTaxByRateReport(tenantId, {
      invoiceType: "BOTH",
    });
    console.log(`✅ Tax by Rate Report:`);
    console.log(`   Tax Rates: ${taxByRate.byRate.length}`);
    console.log(`   Total Tax Collected: $${taxByRate.summary.totalTaxCollected}\n`);

    console.log("✅ All Phase 8 report tests passed!\n");
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testPhase8Reports()
  .then(() => {
    console.log("🎉 Phase 8 report testing complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Phase 8 report testing failed:", error);
    process.exit(1);
  });

