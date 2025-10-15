"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { Appointment } from "@/lib/types";

type PaymentContextType = {
    openPaymentModal: (record: Appointment) => void;
};

interface Privilege {
    name: string;
    chargeType: string;
    amount: number;
}


const PaymentModalContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentModalProvider({ children }: { children: ReactNode }) {
    const [selectedRecord, setSelectedRecord] = useState<Appointment | null>(null);

    const openPaymentModal = (record: Appointment) => setSelectedRecord(record);

    const closeModal = () => setSelectedRecord(null);
    const availablePrivileges = [
        { name: 'สิทธิ์ทั่วไป', chargeType: 'rate', amount: 1.00 },
        { name: 'ประกันสังคม (SSO)', chargeType: 'rate', amount: 0.80 },
        { name: 'บัตรทอง 30 บาท', chargeType: 'fixed', amount: 30 },
        { name: 'ข้าราชการ', chargeType: 'rate', amount: 0.00 },
    ];
    const [selectedPrivilege, setSelectedPrivilege] = useState<Privilege>(availablePrivileges[0]);
    const fullPrice = 300;
    const amountDue = useMemo(() => {
        if (selectedPrivilege.chargeType === 'fixed') {
            return selectedPrivilege.amount;
        } else {
            return fullPrice * selectedPrivilege.amount;
        }
    }, [selectedPrivilege]);

    return (
        <PaymentModalContext.Provider value={{ openPaymentModal }}>
            {children}

            {selectedRecord && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-slide-in">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">ยืนยันการชำระเงิน</h2>
                        <p className="mb-2 text-sm text-gray-600">ใบเสร็จเข้าพบแพทย์: <span className="font-semibold">{selectedRecord.id}</span></p>

                        <hr className="my-4" />

                        <div className="mb-6">
                            <p className="font-medium text-gray-700 mb-2">เลือกสิทธิ์การรักษา:</p>
                            <div className="flex flex-wrap gap-2">
                                {availablePrivileges.map((privilege) => (
                                    <button
                                        key={privilege.name}
                                        onClick={() => setSelectedPrivilege(privilege)}
                                        className={`
                            px-3 py-1 text-sm rounded-full border transition-colors
                            ${selectedPrivilege.name === privilege.name
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                        `}
                                    >
                                        {privilege.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="mb-6 text-md font-medium">
                            จำนวนเงินที่ต้องชำระ:
                            <span className="font-bold text-2xl ml-2 text-green-600">
                                {amountDue.toFixed(0)} บาท
                            </span>
                            {amountDue < fullPrice && (
                                <span className="text-xs text-gray-500 ml-2 line-through">{fullPrice.toFixed(0)} บาท</span>
                            )}
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm">
                            <p className="font-semibold mb-1">ชำระเงินโดยการโอนผ่านบัญชีธนาคาร</p>
                            <p>เลขที่บัญชี: <span className="font-mono">123-456-7890</span></p>
                            <p>ชื่อบัญชี: โรงพยาบาลเท็ดดี้แบร์</p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`/api/payments/${selectedRecord.id}`, {
                                            method: "POST",
                                        });
                                        if (!res.ok) {
                                            alert("เกิดข้อผิดพลาดในการชำระเงิน"); setSelectedRecord(null);
                                            closeModal();
                                        }
                                        alert("ชำระเงินสำเร็จ!");
                                        closeModal();
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    } catch (err: any) {
                                        alert(err.message || "เกิดข้อผิดพลาด");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                ชำระเงิน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PaymentModalContext.Provider>
    );
}

export function usePaymentModal() {
    const context = useContext(PaymentModalContext);
    if (!context) throw new Error("usePaymentModal must be used within PaymentModalProvider");
    return context;
}
