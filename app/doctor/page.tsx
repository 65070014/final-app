"use client"
import Navbar from "@/components/doctor/homepage/navbar"
import Banner from "@/components/doctor/homepage/banner"
import PatientCard from "@/components/doctor/homepage/patient-card"
import { useEffect, useState, useMemo } from "react";

interface Patient {
  patient_id: number;
  fname: string;
  lname: string;
  gender: string;
}

export default function HomePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State สำหรับเก็บคำค้นหา

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/patients');
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อมูลผู้ป่วยได้");
        }
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) {
      return patients;
    }
    return patients.filter(patient =>
      `${patient.fname} ${patient.lname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6">
        <Banner />

        <section className="mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ผู้ป่วยในความดูแล</h2>
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ป่วย..."
              className="border dark:border-gray-700 rounded-full px-4 py-2 text-black bg-white dark:bg-gray-800 dark:text-white w-full md:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="text-center text-gray-500">กำลังโหลดข้อมูลผู้ป่วย...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <PatientCard
                    key={patient.patient_id}
                    name={`${patient.gender === "1" ? "นาย" : "น.ส."} ${patient.fname} ${patient.lname}`}
                    specialty="คนไข้ในระบบ"
                    href={`/doctor/treatment_history/${patient.patient_id}`} 
                  />

                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">ไม่พบผู้ป่วยที่ค้นหา</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
