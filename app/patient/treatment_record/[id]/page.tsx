'use client';

import { FileText, Printer, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { TreatmentDetail } from "@/lib/types";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function SingletreatmentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    router.push(`/doctor/medical_certificate/${id}?print=true`)
  };

  const handlePrintMedic = () => {
    router.push(`/doctor/prescription/${id}?print=true`)
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-4xl mx-auto">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {isLoading ? (
        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการ...</p>
      ) : (
        <>
          <header className="flex justify-between items-center pb-4 border-b">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-gray-700" />
              <h1 className="text-2xl font-bold">บันทึกการรักษา: {treatment.appointment_id}</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับ
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์
              </Button>
            </div>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ข้อมูลผู้ป่วยและวันรักษา</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 text-sm">
              <DetailItem label="ชื่อผู้ป่วย" value={treatment.patient} />
              <DetailItem label="แพทย์ผู้บันทึก" value={treatment.doctorname} />
              <DetailItem label="วันที่" value={format(new Date(treatment.date), "dd MMM yyyy", { locale: th })} />
              <DetailItem label="เวลา" value={treatment.time} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">การวินิจฉัยและบันทึกการรักษา</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="font-medium text-gray-500">ชื่อการวินิจฉัย (ICD-10: {treatment.diag_code})</p>
                <p className="text-base font-semibold text-red-700">{treatment.diag_name}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="font-medium text-gray-500">บันทึกการรักษา (Treatment Note)</p>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap text-sm border">
                  {treatment.diag_note}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <span>รายการยาที่สั่งจ่าย</span>
                <Button variant="secondary" size="sm" onClick={handlePrintMedic}>
                  <Printer className="h-4 w-4 mr-2" /> พิมพ์ใบสั่งยา
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {treatment.medications.map((med, index) => (
                <div key={index} className="border-b last:border-b-0 py-3 grid grid-cols-4 gap-4">
                  <div className="col-span-4 font-semibold text-base text-blue-700">
                    {index + 1}. {med.medicine_name}
                  </div>
                  <DetailItem label="ขนาด/ความแรง" value={med.dosage} />
                  <DetailItem label="วิธีการใช้" value={med.usage} />
                  <DetailItem label="จำนวนที่จ่าย" value={med.quantity} />
                  <DetailItem label="เพิ่มเติม" value={med.note} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">บันทึกเพิ่มเติมและการติดตาม</CardTitle> 
              <Link href={`/patient/vitals_track/${treatment.appointment_id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มบันทึก
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 pb-4">
                <p className="font-medium text-gray-500">สถานะการติดตามผู้ป่วย</p>
                <p className={`font-semibold ${treatment.monitoringStatus === "อยู่ระหว่างติดตาม" ? "text-yellow-600" : "text-green-600"}`}>
                  {treatment.monitoringStatus}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string | number;
}
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="font-medium text-gray-500">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);