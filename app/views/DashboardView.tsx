'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { Users, FileText, DollarSign, CreditCard, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardView({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { customers, contracts, payroll, exportedPeriods } = useAppContext();

  const totalRevenue = 
    contracts.filter(c => c.type === 'placement').reduce((sum, c) => sum + c.rate, 0) + 
    payroll.reduce((sum, p) => sum + p.totalAmount, 0);

  const stats = [
    { name: 'Total Customers', value: customers.length, icon: Users, tab: 'customers', color: 'bg-blue-500' },
    { name: 'Active Contracts', value: contracts.filter(c => c.active).length, icon: FileText, tab: 'customers', color: 'bg-green-500' },
    { name: 'Payroll Records', value: payroll.length, icon: DollarSign, tab: 'payroll', color: 'bg-yellow-500' },
    { name: 'Total Billed Value', value: formatCurrency(totalRevenue), icon: CreditCard, tab: 'reports', color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your staffing business operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate(item.tab)}
            >
              <dt>
                <div className={`absolute rounded-md ${item.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <span className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                      View all <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>
              </dd>
            </div>
          );
        })}
      </div>
    </div>
  );
}
