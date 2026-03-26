/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { FileText, Printer, ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { TreatmentDetail } from "@/lib/types";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { PatientNav } from "@/components/patient/patient_nav"

export default function SingletreatmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true)
  const [treatment, setTreatment] = useState<TreatmentDetail>({
    appointment_id: '',
    date: '',
    time: '',
    doctorname: '',
    patient: '',
    diag_name: '',
    diag_note: '',
    diag_code: '',
    monitoringStatus: '',
    medications: [],
  })
  const [error, setError] = useState<string | null>(null);
  const { id } = use(params);

  useEffect(() => {
    async function fetchDetails() {
      if (status !== 'authenticated' || !session?.user?.id) {
        if (status !== 'loading') {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/treatment_detail/${id}`);

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
        }

        const data = await response.json();
        setTreatment(data);
        console.log(data)

      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (status === 'authenticated') {
      fetchDetails();
    }

  }, [id, session, status]);

  const handlePrint = () => {
    window.open(`/doctor/medical_certificate/${id}?print=true`, '_blank');
  };

  const handlePrintMedic = () => {
    window.open(`/doctor/prescription/${id}?print=true`, '_blank');
  };

  return (
    <div className="flex h-screen bg-slate-200 font-sans">
      <PatientNav />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {error && <p className="text-red-500 text-[1.1rem] text-center">{error}</p>}
        {isLoading ? (
          <p className="text-center text-gray-500 py-10 text-[1.2rem]">กำลังโหลดรายการ...</p>
        ) : (
          /* 🌟 บีบความกว้างด้วย max-w-5xl และจัดให้อยู่กึ่งกลางด้วย mx-auto */
          <div className="max-w-5xl mx-auto space-y-6 pb-10">
            <header className="flex justify-between items-center pb-4 border-b border-gray-300">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-gray-700" />
                <h1 className="text-[1.8rem] font-bold text-gray-900">บันทึกการรักษา: {treatment.appointment_id}</h1>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="text-[1rem] px-4 py-2" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  กลับ
                </Button>
                <Button variant="outline" className="text-[1rem] px-4 py-2" onClick={handlePrint}>
                  <Printer className="h-5 w-5 mr-2" />
                  พิมพ์
                </Button>
              </div>
            </header>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[1.4rem] font-bold">ข้อมูลผู้ป่วยและวันรักษา</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4">
                <DetailItem label="ชื่อผู้ป่วย" value={treatment.patient} />
                <DetailItem label="แพทย์ผู้บันทึก" value={treatment.doctorname} />
                <DetailItem label="วันที่" value={format(new Date(treatment.date), "dd MMM yyyy", { locale: th })} />
                <DetailItem label="เวลา" value={treatment.time} />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[1.4rem] font-bold">การวินิจฉัยและบันทึกการรักษา</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <p className="font-medium text-gray-500 text-[1.1rem]">ชื่อการวินิจฉัย (ICD-10: {treatment.diag_code})</p>
                  <p className="text-[1.5rem] font-bold text-red-700">{treatment.diag_name}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="font-medium text-gray-500 text-[1.1rem]">บันทึกการรักษา (Treatment Note)</p>
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-[1.15rem] leading-relaxed border border-gray-200 text-gray-800">
                    {treatment.diag_note}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-[1.4rem] font-bold flex justify-between items-center">
                  <span>รายการยาที่สั่งจ่าย</span>
                  <Button variant="secondary" size="sm" className="text-[1rem] py-5" onClick={handlePrintMedic}>
                    <Printer className="h-5 w-5 mr-2" /> พิมพ์ใบสั่งยา
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {treatment.medications.map((med, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-b-0 py-5 grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-2 lg:col-span-4 font-bold text-[1.3rem] text-blue-700 pb-1">
                      {index + 1}. {med.medicine_name}
                    </div>
                    <DetailItem label="จำนวนที่จ่าย" value={med.dosage} />
                    <DetailItem label="วิธีการใช้" value={med.usage} />
                    <DetailItem label="เพิ่มเติม" value={med.note} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string | number;
}
/* 🌟 อัปเดตขนาด Component ย่อยที่ใช้แสดงข้อมูลด้วย */
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="font-medium text-gray-500 text-[1.1rem]">{label}</p>
    <p className="text-[1.2rem] font-bold text-gray-900">{value}</p>
  </div>
);