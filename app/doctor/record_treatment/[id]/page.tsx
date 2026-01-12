"use client"

import { useState, useRef } from "react"
import { PatientReferencePanel } from "@/components/doctor/medical_record/patient_panel"
import { DiagnosisSection } from "@/components/doctor/medical_record/diagnosis_section"
import { MedicationSection } from "@/components/doctor/medical_record/medication_section"
import { MonitoringSection } from "@/components/doctor/medical_record/monitoring_section"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"
import { useParams, useRouter} from 'next/navigation';


export default function MedicalRecordForm() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<any>(null);
  const params = useParams();
  const router = useRouter();

  const { id: appointmentId } = params;
  const getInitialData = () => {
    if (typeof window !== 'undefined') {
      const diagItem = sessionStorage.getItem('initialDiagnosisNote');
      const medsItem = sessionStorage.getItem('initialMedications');

      sessionStorage.removeItem('initialDiagnosisNote');
      sessionStorage.removeItem('initialMedications');

      return {
        diag: diagItem ? JSON.parse(diagItem) : { diagName: "", diagCode: "", treatmentNote: "" },
        meds: medsItem ? JSON.parse(medsItem) : [],
      };
    }
    return { diag: { diagName: "", diagCode: "", treatmentNote: "" }, meds: [] };
  };

  const initialData = getInitialData();

  const [diagnosisNote, setDiagnosisNote] = useState(initialData.diag);
  const [medications, setMedications] = useState(initialData.meds);

  const [monitoring, setMonitoring] = useState({
    isActive: false,
    endDate: "",
  })

  const handleSaveRecord = async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const payload = {
      appointmentId,
      diagnosisNote,
      medications,
      monitoring,
    };
    try {
      const res = await fetch("/api/record_treatment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      console.log("API Response:", result);

      alert("บันทึกเวชระเบียนเรียบร้อยแล้ว");

      router.push('/doctor/vitals_track/1');

    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error("Submission Error:", errorMessage);
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${errorMessage}`);
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">บันทึกเวชระเบียน</h1>
        <p className="text-muted-foreground">กรอกข้อมูลการตรวจและวินิจฉัยผู้ป่วย</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PatientReferencePanel appointmentId={appointmentId} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <DiagnosisSection diagnosisNote={diagnosisNote} setDiagnosisNote={setDiagnosisNote} />

          <MedicationSection medications={medications} setMedications={setMedications} />

          <MonitoringSection monitoring={monitoring} setMonitoring={setMonitoring} />

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" size="lg">
              ยกเลิก
            </Button>
            <Button size="lg" onClick={handleSaveRecord} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              บันทึกเวชระเบียนและสิ้นสุดการปรึกษา
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
