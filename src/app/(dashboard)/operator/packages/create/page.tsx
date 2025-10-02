'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { OperatorSidebar } from '@/components/dashboard/OperatorSidebar';
import { Button } from '@/components/ui/button';
import CompactPackageWizard from '@/components/packages/create/CompactPackageWizard';

export default function CreatePackagePage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSuccess = (packageId: string) => {
    router.push(`/operator/packages/${packageId}`);
  };

  const handleCancel = () => {
    router.push('/operator/packages');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <OperatorSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div 
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      >
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create Package</h1>
                <p className="text-slate-600">Create a new travel package</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          <CompactPackageWizard 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </main>
      </div>
    </div>
  );
}
