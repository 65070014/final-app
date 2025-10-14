import React from 'react';
import { DispensingRecord} from '@/lib/types';
import { Pill, User, Clock, Package, AlertCircle } from 'lucide-react';

export function DispensingRecordCard({ record }: { record: DispensingRecord }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg transition-shadow hover:shadow-xl overflow-hidden">

            <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-lg text-blue-800">
                        ใบสั่งยา #{record.prescription_id}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 shrink-0" />
                        วันที่รับยา: <span className='font-semibold ml-1'>{record.appointment_date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2 shrink-0" />
                        แพทย์ผู้สั่ง: <span className='font-semibold ml-1'>{record.doctor_name}</span>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">รายการยาที่ถูกจ่าย ({record.items.length} ชนิด)</h4>
                <div className="space-y-4">
                    {record.items.map((item, index) => (
                        <div key={index} className="border-t border-gray-100 pt-3 mt-3">
                            <div className="flex justify-between items-start">
                                <h5 className="font-semibold text-gray-800 flex items-center">
                                    <Pill className="h-4 w-4 mr-2 text-blue-500 shrink-0" />
                                    {item.medicine_name}
                                </h5>
                                <span className="text-sm px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center">
                                    <Package className="h-3 w-3 mr-1" />
                                    {item.quantity} เม็ด
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                <span className="text-gray-500">ขนาดใช้: <span className="text-gray-800 font-medium">{item.dosage}</span></span>
                                <span className="text-gray-500">วิธีใช้: <span className="text-green-700 font-medium">{item.usage}</span></span>
                            </div>
                            {item.note && (
                                <p className="text-xs text-red-600 mt-1 flex items-start">
                                    <AlertCircle className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                                    หมายเหตุ: {item.note}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}