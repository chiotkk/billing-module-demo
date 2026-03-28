'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/store';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Upload, X, FileJson, Search } from 'lucide-react';

export default function PayrollView() {
  const { payroll, contracts, addPayroll } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState<'workerName' | 'contractType' | 'periodStart' | 'totalAmount' | 'ingestedAt'>('ingestedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const eligibleContracts = contracts.filter(c => c.type !== 'placement' && c.active);

  const processedPayroll = useMemo(() => {
    return payroll.map(record => {
      const contract = contracts.find(c => c.id === record.contractId);
      return {
        ...record,
        workerName: contract?.workerName || 'Unknown',
        contractType: contract?.type || 'Unknown'
      };
    });
  }, [payroll, contracts]);

  const filteredAndSortedPayroll = useMemo(() => {
    return processedPayroll
      .filter(record => {
        const matchesSearch = record.workerName.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterType === 'all' || record.contractType === filterType;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (sortField === 'totalAmount') {
          return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        } else {
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        }
      });
  }, [processedPayroll, search, filterType, sortField, sortOrder]);

  const handleSort = (field: 'workerName' | 'contractType' | 'periodStart' | 'totalAmount' | 'ingestedAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleLoadTemplate = () => {
    if (eligibleContracts.length === 0) {
      setError("No active temp/contract workers found to generate a template.");
      return;
    }
    const template = eligibleContracts.map(c => ({
      contractId: c.id,
      workerName: c.workerName,
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      components: [
        { name: "Base Pay", amount: 4000 },
        { name: "Overtime", amount: 250 }
      ]
    }));
    setJsonInput(JSON.stringify(template, null, 2));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array of records.");
      }

      const recordsToAdd = [];
      for (const record of parsed) {
        if (!record.contractId || !record.periodStart || !record.periodEnd || !Array.isArray(record.components)) {
          throw new Error("Each record must have contractId, periodStart, periodEnd, and components array.");
        }
        
        const validComponents = record.components
          .filter((c: any) => c.name && typeof c.amount === 'number' && c.amount > 0)
          .map((c: any) => ({ name: c.name, amount: c.amount }));

        if (validComponents.length > 0) {
          recordsToAdd.push({
            contractId: record.contractId,
            periodStart: record.periodStart,
            periodEnd: record.periodEnd,
            components: validComponents,
          });
        }
      }

      if (recordsToAdd.length === 0) {
        throw new Error("No valid records with positive component amounts found.");
      }

      recordsToAdd.forEach(record => addPayroll(record));
      
      setJsonInput('');
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || "Invalid JSON format.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
            Payroll Ingestion
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bulk ingest upstream payroll data for the period.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Upload Payroll File
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search by worker name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Types</option>
            <option value="temp">Temp Worker</option>
            <option value="contract">Contract Worker</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('workerName')}
              >
                Worker Name {sortField === 'workerName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('contractType')}
              >
                Contract Type {sortField === 'contractType' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('periodStart')}
              >
                Period {sortField === 'periodStart' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Components</th>
              <th 
                scope="col" 
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalAmount')}
              >
                Total Amount {sortField === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ingestedAt')}
              >
                Ingested Date {sortField === 'ingestedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredAndSortedPayroll.map((record) => (
              <tr key={record.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{record.workerName}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{record.contractType}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.periodStart} to {record.periodEnd}</td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <ul className="list-disc pl-4">
                    {record.components.map((comp: any, idx: number) => (
                      <li key={idx}>{comp.name}: {formatCurrency(comp.amount)}</li>
                    ))}
                  </ul>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{formatCurrency(record.totalAmount)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(record.ingestedAt)}</td>
              </tr>
            ))}
            {filteredAndSortedPayroll.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Upload Bulk Payroll File</h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Paste a JSON array containing the payroll records for this period. 
                        <button onClick={handleLoadTemplate} className="text-indigo-600 hover:text-indigo-500 ml-2 font-medium">
                          Load Template
                        </button>
                      </p>
                      
                      {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Error parsing JSON</h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <textarea
                            rows={15}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono px-3"
                            placeholder="[\n  {\n    &quot;contractId&quot;: &quot;ct2&quot;,\n    &quot;periodStart&quot;: &quot;2026-03-01&quot;,\n    &quot;periodEnd&quot;: &quot;2026-03-15&quot;,\n    &quot;components&quot;: [\n      { &quot;name&quot;: &quot;Base Pay&quot;, &quot;amount&quot;: 4000 }\n    ]\n  }\n]"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            required
                          />
                        </div>

                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                          >
                            <FileJson className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Process File
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setIsModalOpen(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
