'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function ReportsView() {
  const { contracts, payroll } = useAppContext();
  const [activeTab, setActiveTab] = useState<'sales' | 'client'>('sales');
  
  // Date range for Sales Report
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  React.useEffect(() => {
    setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
  }, []);

  const salesData = useMemo(() => {
    if (!startDate || !endDate) return { placementsCount: 0, totalPlacements: 0, payrollsCount: 0, totalPayrolls: 0, totalRevenue: 0, placements: [], payrolls: [] };
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Placements in period
    const placements = contracts.filter(c => {
      const d = new Date(c.startDate);
      return c.type === 'placement' && d >= start && d <= end;
    });

    // Payrolls in period
    const payrolls = payroll.filter(p => {
      const d = new Date(p.periodEnd);
      return d >= start && d <= end;
    });

    const totalPlacements = placements.reduce((sum, c) => sum + c.rate, 0);
    const totalPayrolls = payrolls.reduce((sum, p) => sum + p.totalAmount, 0);

    return {
      placementsCount: placements.length,
      totalPlacements,
      payrollsCount: payrolls.length,
      totalPayrolls,
      totalRevenue: totalPlacements + totalPayrolls,
      placements,
      payrolls
    };
  }, [contracts, payroll, startDate, endDate]);

  const handleExport = () => {
    const csvRows = [];
    csvRows.push(['Type', 'Worker/Contract', 'Amount', 'Date']);
    
    salesData.placements.forEach(p => {
      csvRows.push(['Placement', p.workerName, p.rate, p.startDate]);
    });
    
    salesData.payrolls.forEach(p => {
      const contract = contracts.find(c => c.id === p.contractId);
      csvRows.push(['Payroll', contract?.workerName || 'Unknown', p.totalAmount, p.periodEnd]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
            Reports
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate business insights and reports.
          </p>
        </div>
        {activeTab === 'sales' && (
          <div className="mt-4 sm:ml-4 sm:mt-0">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Download className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('sales')}
            className={`${
              activeTab === 'sales'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Sales Report
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`${
              activeTab === 'client'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Client-side Report
          </button>
        </nav>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Placement Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{formatCurrency(salesData.totalPlacements)}</dd>
              <dd className="mt-2 text-sm text-gray-500">{salesData.placementsCount} deals closed</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Contract/Temp Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{formatCurrency(salesData.totalPayrolls)}</dd>
              <dd className="mt-2 text-sm text-gray-500">{salesData.payrollsCount} payroll cycles billed</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-indigo-50 px-4 py-5 shadow sm:p-6 border border-indigo-100">
              <dt className="truncate text-sm font-medium text-indigo-600">Total Billed Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-indigo-900">{formatCurrency(salesData.totalRevenue)}</dd>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'client' && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Client-side Report</h3>
          <p className="mt-1 text-sm text-gray-500">This report is to be confirmed (TBC).</p>
        </div>
      )}
    </div>
  );
}
