"use client"
import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle,Pill } from 'lucide-react';
import { DispensingRecordCard } from '@/components/patient/dispensingRecord/dispensing_record_card';
import { DispensingRecord } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { PatientNav } from "@/components/patient/patient_nav"
import { Card } from "@/components/ui/card";


export default function DispensingHistoryPage() {
    const { data: session, status } = useSession();
    const [history, setHistory] = useState<DispensingRecord[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDispensing() {
            if (status !== 'authenticated' || !session?.user?.id) {
                if (status !== 'loading') {
                    setIsLoading(false);
                }
                return;
            }

            setIsLoading(true);
            setError(null);
            const patient_id = session.user.id
            try {
                const response = await fetch(`/api/patients/dispensing_history/${patient_id}`);

                if (!response.ok) {
                    throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
                }

                const data = await response.json();
                setHistory(data);
                console.log(data)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error("Error fetching appointments:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
        if (status === 'authenticated') {
            fetchDispensing();
        }

    }, [session, status]);

    return (
        <div className="flex h-screen bg-slate-200 font-sans">
            <PatientNav />

            <main className="flex-1 overflow-y-auto p-4 md:p-8">

                <div className="mx-auto max-w-5xl space-y-6">

                    <header>
                        <Card className="p-6 w-full shadow-sm border border-slate-300 rounded-xl bg-white">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Pill className="h-6 w-6" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-slate-800">ประวัติการรับยา</h1>
                                    </div>
                                    <p className="text-slate-500 text-sm mt-1 ml-11">
                                        รายการใบสั่งยาและการจ่ายยาที่ท่านได้รับทั้งหมด
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </header>

                    {/* 4. พื้นที่แสดงข้อมูล */}
                    <div className="min-h-[500px]">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                                <Loader className="h-8 w-8 animate-spin text-blue-500" />
                                <p className="mt-4 text-slate-500">กำลังโหลดประวัติ...</p>
                            </div>
                        )}

                        {!isLoading && !error && (
                            <>
                                {history && history.length > 0 ? (
                                    <div className="space-y-6">
                                        {history.map(record => (
                                            <DispensingRecordCard key={record.prescription_id} record={record} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center">
                                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                            <AlertCircle className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-700">ไม่พบประวัติการรับยา</h2>
                                        <p className="text-slate-500 mt-1 max-w-xs">
                                            ท่านยังไม่เคยมีการรับยาจากสถานพยาบาลนี้ หรือข้อมูลยังไม่ถูกบันทึกเข้าระบบ
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}