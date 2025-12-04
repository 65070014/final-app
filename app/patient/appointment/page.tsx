"use client"

import { AppointmentForm } from "@/components/patient/appointment/appointment_form"
import { PatientNav } from "@/components/patient/patient_nav"
import { Card } from "@/components/ui/card"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PatientAppointmentList } from '@/components/patient/appointment/patient_appointment_list';

export default function AppointmentPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  return (
    <div className="flex h-screen bg-slate-200 font-sans">
  <PatientNav />
  <main className="flex-1 overflow-y-auto p-4 md:p-8">
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <Card className="p-6 w-full shadow-sm border border-slate-300 rounded-xl bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">การนัดหมาย</h1>
              <p className="text-slate-500 text-sm mt-1">จัดการตารางนัดหมายและการจองคิวของคุณ</p>
            </div>
            <AppointmentForm />
          </div>
        </Card>
      </header>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm w-fit">
          <Button
            onClick={() => setActiveTab('upcoming')}
            variant={activeTab === 'upcoming' ? 'secondary' : 'ghost'}
            className={`text-sm ${activeTab === 'upcoming' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500'}`}
          >
            นัดหมายที่กำลังจะมาถึง
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'secondary' : 'ghost'}
            className={`text-sm ${activeTab === 'history' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500'}`}
          >
            ประวัติการนัดหมาย
          </Button>
        </div>
        <div className="min-h-[500px]"> 
          <PatientAppointmentList activeTab={activeTab} />
        </div>
      </div>
    </div>
  </main>
</div>
  )
}
