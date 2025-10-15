"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DispensingRecord } from "@/lib/types";

type PaymentContextType = {
    openPaymentModal: (record: DispensingRecord) => void;
};

const PaymentModalContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentModalProvider({ children }: { children: ReactNode }) {
    const [selectedRecord, setSelectedRecord] = useState<DispensingRecord | null>(null);

    const openPaymentModal = (record: DispensingRecord) => setSelectedRecord(record);

    const closeModal = () => setSelectedRecord(null);

    return (
        <PaymentModalContext.Provider value={{ openPaymentModal }}>
            {children}

            {/* Modal */}
            {selectedRecord && (
                <div className="fixed inset-0  flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg animate-slide-in">
                        <h2 className="text-2xl font-bold mb-4">ยืนยันการชำระเงิน</h2>
                        <p className="mb-4">ใบสั่งยา: <span className="font-semibold">{selectedRecord.prescription_id}</span></p>
                        <p className="mb-6">จำนวนเงินที่ต้องชำระ: <span className="font-semibold text-lg text-blue-600">300 บาท</span></p>
                        ชำระเงินโดยการโอนผ่านบัญชีธนาคาร หรือพร้อมเพย์<br />
                        เลขที่บัญชี: 123-456-7890<br />
                        ชื่อบัญชี: โรงพยาบาลเท็ดดี้แบร์<br />
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`/api/payments/${selectedRecord.prescription_id}`, {
                                            method: "POST",
                                        });
                                        if (!res.ok) {
                                            alert("เกิดข้อผิดพลาดในการชำระเงิน"); setSelectedRecord(null); // or setSelectedRecord(undefined)
                                            closeModal();
                                        }
                                        alert("ชำระเงินสำเร็จ!");
                                        closeModal();
                                    } catch (err: any) {
                                        alert(err.message || "เกิดข้อผิดพลาด");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
