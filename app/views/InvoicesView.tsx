'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Download, X } from 'lucide-react';

export default function InvoicesView() {
  const { customers, contracts, payroll, exportedPeriods, markPeriodExported } = useAppContext();
  
  // Default to current month
  const [selectedMonth, setSelectedMonth] = useState('');
  
  React.useEffect(() => {
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  }, []);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPayload, setExportPayload] = useState<string>('');

  const isExported = exportedPeriods.some(ep => ep.period === selectedMonth);

  // Calculate billing items for the selected month
  const billingItems = useMemo(() => {
    const items: any[] = [];
    if (!selectedMonth) return items;
    
    // 1. Placements starting in this month
    contracts.filter(c => c.type === 'placement' && c.startDate.startsWith(selectedMonth)).forEach(contract => {
      items.push({
        id: `placement-${contract.id}`,
        customerId: contract.customerId,
        contractId: contract.id,
        amount: contract.rate,
        description: `Placement Fee for ${contract.workerName}`,
        type: 'Placement',
        date: contract.startDate,
      });
    });

    // 2. Payrolls ending in this month
    payroll.filter(p => p.periodEnd.startsWith(selectedMonth)).forEach(pRecord => {
      const contract = contracts.find(c => c.id === pRecord.contractId);
      if (contract) {
        items.push({
          id: `payroll-${pRecord.id}`,
          customerId: contract.customerId,
          contractId: contract.id,
          amount: pRecord.totalAmount, // Invoicing the total payroll amount
          description: `${contract.type === 'temp' ? 'Temp Worker' : 'Contractor'} Payroll (${pRecord.periodStart} to ${pRecord.periodEnd}) - ${contract.workerName}`,
          type: 'Payroll',
          date: pRecord.periodEnd,
          components: pRecord.components,
        });
      }
    });

    return items;
  }, [selectedMonth, contracts, payroll]);

  const totalBilling = billingItems.reduce((sum, item) => sum + item.amount, 0);

  const handleExport = () => {
    if (billingItems.length === 0) return;
    
    // Create payload for finance system
    const payload = billingItems.map(item => {
      const customer = customers.find(c => c.id === item.customerId);
      const contract = contracts.find(c => c.id === item.contractId);
      
      return {
        billingId: item.id,
        billingPeriod: selectedMonth,
        customerName: customer?.company || 'Unknown',
        customerEmail: customer?.email || '',
        amount: item.amount,
        description: item.description,
        contractType: contract?.type || 'Unknown',
        components: item.components || [],
      };
    });

    setExportPayload(JSON.stringify(payload, null, 2));
    setIsExportModalOpen(true);
    markPeriodExported(selectedMonth);
  };

  const getCustomerName = (id: string) => {
    return customers.find(c => c.id === id)?.company || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
            Monthly Billing Review
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review billing items for the selected month and export to the finance system.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex items-center space-x-4">
          <div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={billingItems.length === 0 || isExported}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            {isExported ? 'Already Exported' : `Export to Finance (${billingItems.length})`}
          </button>
        </div>
      </div>

      {isExported && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Billing Exported</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>The billing data for {selectedMonth} has already been sent to the finance system.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Customer</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {billingItems.map((item) => (
              <tr key={item.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{getCustomerName(item.customerId)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${item.type === 'Placement' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 'bg-purple-50 text-purple-700 ring-purple-600/20'}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.description}>{item.description}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            {billingItems.length > 0 && (
              <tr className="bg-gray-50">
                <td colSpan={3} className="py-4 pl-4 pr-3 text-right text-sm font-bold text-gray-900 sm:pl-6">Total for {selectedMonth}:</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">{formatCurrency(totalBilling)}</td>
              </tr>
            )}
            {billingItems.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                  No billing items found for {selectedMonth}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setIsExportModalOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Finance System Payload</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        This JSON payload represents the data sent to the downstream finance system to generate actual invoices for {selectedMonth}.
                      </p>
                      <div className="bg-gray-900 rounded-md p-4 overflow-auto max-h-96">
                        <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                          {exportPayload}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setIsExportModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
