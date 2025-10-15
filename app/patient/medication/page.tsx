"use client"
import React, { useState, useEffect } from 'react';
import { Clock, Loader, AlertCircle } from 'lucide-react';
import { DispensingRecordCard } from '@/components/patient/dispensingRecord/dispensing_record_card';
import { DispensingRecord } from '@/lib/types';
import { useSession } from 'next-auth/react';



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
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    <Clock className="h-7 w-7 mr-3 text-blue-600" />
                    ประวัติการรับยา
                </h1>
                <p className="text-gray-500 mt-1">รายการใบสั่งยาและการจ่ายยาที่ท่านได้รับทั้งหมด</p>
            </header>

            {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
                    <Loader className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-4 text-lg text-gray-600">กำลังโหลดประวัติ...</p>
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
                        <div className="p-10 text-center bg-yellow-50 border border-yellow-300 rounded-lg mx-auto mt-10">
                            <AlertCircle className="h-10 w-10 mx-auto text-yellow-600 mb-4" />
                            <h2 className="text-xl font-bold text-yellow-800">ไม่พบประวัติการรับยา</h2>
                            <p className="text-yellow-700 mt-2">ท่านยังไม่เคยมีการรับยาจากสถานพยาบาลนี้</p>
                        </div>
                    )}
                </>
            )} 
        </div>
    );
}