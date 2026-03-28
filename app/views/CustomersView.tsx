'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext, ContractType, ContractSubtype } from '@/lib/store';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Search, ChevronRight, ArrowLeft, Plus, X } from 'lucide-react';

export default function CustomersView() {
  const { customers, contracts, addContract } = useAppContext();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'company' | 'name' | 'onboardedAt'>('company');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const [contractFormData, setContractFormData] = useState({
    workerName: '',
    type: 'placement' as ContractType,
    subtype: 'none' as ContractSubtype,
    rate: '',
    startDate: '',
  });

  React.useEffect(() => {
    setContractFormData(prev => ({
      ...prev,
      startDate: new Date().toISOString().split('T')[0]
    }));
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => 
        c.company.toLowerCase().includes(search.toLowerCase()) || 
        c.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [customers, search, sortField, sortOrder]);

  const handleSort = (field: 'company' | 'name' | 'onboardedAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    addContract({
      customerId: selectedCustomerId,
      workerName: contractFormData.workerName,
      type: contractFormData.type,
      subtype: contractFormData.type === 'contract' ? contractFormData.subtype : 'none',
      rate: parseFloat(contractFormData.rate),
      startDate: new Date(contractFormData.startDate).toISOString(),
    });
    setContractFormData({
      workerName: '',
      type: 'placement',
      subtype: 'none',
      rate: '',
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsContractModalOpen(false);
  };

  // Drill-down view
  if (selectedCustomerId) {
    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerContracts = contracts.filter(c => c.customerId === selectedCustomerId);

    if (!customer) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSelectedCustomerId(null)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
              {customer.company}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Contact: {customer.name} ({customer.email})
            </p>
          </div>
        </div>

        <div className="sm:flex sm:items-center sm:justify-between mt-8">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Contracts</h3>
          <button
            type="button"
            onClick={() => setIsContractModalOpen(true)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Contract
          </button>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Worker Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rate/Fee</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {customerContracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{contract.workerName}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                    {contract.type}
                    {contract.subtype !== 'none' && <span className="text-xs text-gray-400 block">{contract.subtype.replace('-', ' ')}</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(contract.rate)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(contract.startDate)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${contract.active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                      {contract.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {customerContracts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No contracts found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Contract Modal */}
        {isContractModalOpen && (
          <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => setIsContractModalOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">New Contract for {customer.company}</h3>
                      <div className="mt-2">
                        <form onSubmit={handleContractSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="workerName" className="block text-sm font-medium leading-6 text-gray-900">Worker Name</label>
                            <div className="mt-2">
                              <input
                                type="text"
                                id="workerName"
                                required
                                value={contractFormData.workerName}
                                onChange={(e) => setContractFormData({...contractFormData, workerName: e.target.value})}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">Contract Type</label>
                              <div className="mt-2">
                                <select
                                  id="type"
                                  required
                                  value={contractFormData.type}
                                  onChange={(e) => setContractFormData({...contractFormData, type: e.target.value as ContractType})}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                >
                                  <option value="placement">One-off Placement</option>
                                  <option value="temp">Temp Worker</option>
                                  <option value="contract">Contract Worker</option>
                                </select>
                              </div>
                            </div>

                            {contractFormData.type === 'contract' && (
                              <div>
                                <label htmlFor="subtype" className="block text-sm font-medium leading-6 text-gray-900">Subtype</label>
                                <div className="mt-2">
                                  <select
                                    id="subtype"
                                    required
                                    value={contractFormData.subtype}
                                    onChange={(e) => setContractFormData({...contractFormData, subtype: e.target.value as ContractSubtype})}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                  >
                                    <option value="contract-basis">Contract Basis</option>
                                    <option value="timesheet-basis">Timesheet Basis</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="rate" className="block text-sm font-medium leading-6 text-gray-900">
                                {contractFormData.type === 'placement' ? 'Placement Fee' : 'Rate (Hourly/Monthly)'}
                              </label>
                              <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                  type="number"
                                  id="rate"
                                  required
                                  min="0"
                                  step="0.01"
                                  value={contractFormData.rate}
                                  onChange={(e) => setContractFormData({...contractFormData, rate: e.target.value})}
                                  className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            <div>
                              <label htmlFor="startDate" className="block text-sm font-medium leading-6 text-gray-900">Start Date</label>
                              <div className="mt-2">
                                <input
                                  type="date"
                                  id="startDate"
                                  required
                                  value={contractFormData.startDate}
                                  onChange={(e) => setContractFormData({...contractFormData, startDate: e.target.value})}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                              type="submit"
                              className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                            >
                              Save Contract
                            </button>
                            <button
                              type="button"
                              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                              onClick={() => setIsContractModalOpen(false)}
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

  // Main Customers List View
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
            Customers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Search and manage your customers. Click a customer to view their contracts.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 max-w-md">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search by company or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('company')}
              >
                Company {sortField === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Contact Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
              <th 
                scope="col" 
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('onboardedAt')}
              >
                Onboarded Date {sortField === 'onboardedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredCustomers.map((customer) => (
              <tr 
                key={customer.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedCustomerId(customer.id)}
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{customer.company}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{customer.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(customer.onboardedAt)}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <ChevronRight className="h-5 w-5 text-gray-400 inline" />
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                  No customers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
