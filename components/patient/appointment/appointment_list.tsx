"use client"
import { Card } from "@/components/ui/card"
import { Appointment } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchAppointments() {
      if (status !== 'authenticated' || !session?.user?.id) {
        if (status !== 'loading') {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const patientId = session.user.id;
        const response = await fetch(`/api/appointments/patient/${patientId}`);

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
        }

        const data = await response.json();
        setAppointments(data);
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
      fetchAppointments();
    }

  }, [session, status]);

  return (
    <Card className="p-6 space-y-4 h-full shadow-lg">
      <h2 className="text-lg font-semibold">นัดหมายของคุณ</h2>
      {isLoading && (
        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
      )}

      {!isLoading && appointments.length === 0 && (
        <p className="text-center text-gray-500 py-10">ไม่พบรายการนัดหมาย</p>
      )}
      {!isLoading && appointments.length > 0 && (
        <>
          {appointments.map((a, i) => (
            <div key={i} className="border-b pb-2">
              <p className="font-medium">{a.date} เวลา {a.time}</p>
              <p className="text-sm text-muted-foreground">
                {a.department} - {a.doctorname}
              </p>
            </div>
          ))}
        </>
      )}
    </Card>
  )
}
