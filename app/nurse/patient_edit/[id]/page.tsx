/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SetStateAction, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // 🌟 เพิ่ม useParams เพื่อดึง ID จาก URL
import PersonalDetailsForm from '@/components/patient/register/personal-details-form';
import AddressDetailsForm from '@/components/patient/register/address-details-form';
import HealthDetailsForm from '@/components/patient/register/health-details-form';
import { FormRegisterData } from '@/lib/types'
import { validateRegisterStep } from '@/utils/formValidation'

const initialFormData: FormRegisterData = {
  firstName: '', lastName: '', gender: '', nation: '', occupation: '',
  phone_number: '', id: '', dob: '', bloodType: '', email: '',
  houseno: '', road: '', tambon: '', ampur: '', changwat: '',
  village: '', emergency_phone_number: '', underlying_disease: '', drugallergy: '',
  weight: 0, height: 0,
  password: '', confirm_password: '', // 💡 รหัสผ่านอาจจะเว้นว่างไว้ตอนแก้ไข
};

export default function EditPatientForm() {
  const router = useRouter();
  const params = useParams(); 
  const patientId = params.id;

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<FormRegisterData>(initialFormData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;
      
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, ...data, password: '', confirm_password: '' }));
        } else {
          alert("ไม่พบข้อมูลผู้ป่วย");
          router.push('/nurse');
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, router]);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    const stepErrors = validateRegisterStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const goToStep = (stepNumber: SetStateAction<number>) => {
    setCurrentStep(stepNumber);
  };

  const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    const stepErrors = validateRegisterStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('อัปเดตข้อมูลผู้ป่วยสำเร็จ! ✅');
        router.push('/nurse');
      } else {
        setErrors(result.errors || {});
        alert(`อัปเดตไม่สำเร็จ: ${result.error}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  // 🌟 ถ้ายิง API ดึงข้อมูลยังไม่เสร็จ ให้โชว์หน้าโหลดก่อน
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <span className="ml-3 text-lg font-bold text-gray-600">กำลังโหลดข้อมูลผู้ป่วย...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* 🌟 เปลี่ยนหัวข้อให้เข้ากับการแก้ไข */}
        <div className="text-center mb-12 border-b pb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-600 dark:text-purple-400 mb-2">
            แก้ไขข้อมูลผู้ป่วย
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400">
            รหัสผู้ป่วย: {patientId}
          </p>
        </div>

        {/* ================ แถบ Step (เหมือนเดิม) ================ */}
        <div className="grid grid-cols-3 gap-6 mb-12 relative after:absolute after:top-1/4 after:left-0 after:right-0 after:h-0.5 after:bg-gray-200 dark:after:bg-gray-700 after:z-0">
          
          <div className="flex flex-col items-center z-10" onClick={() => goToStep(1)}>
            <div className={`w-10 h-10 rounded-full border-4 transition-all duration-300 ${currentStep >= 1 ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'} flex items-center justify-center font-extrabold mb-2 cursor-pointer`}>
              1
            </div>
            <p className={`text-sm ${currentStep >= 1 ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-500'} text-center cursor-pointer`}>ข้อมูลส่วนตัว</p>
          </div>

          <div className="flex flex-col items-center z-10" onClick={() => goToStep(2)}>
            <div className={`w-10 h-10 rounded-full border-4 transition-all duration-300 ${currentStep >= 2 ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'} flex items-center justify-center font-extrabold mb-2 cursor-pointer`}>
              2
            </div>
            <p className={`text-sm ${currentStep >= 2 ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-500'} text-center cursor-pointer`}>ข้อมูลที่อยู่</p>
          </div>

          <div className="flex flex-col items-center z-10" onClick={() => goToStep(3)}>
            <div className={`w-10 h-10 rounded-full border-4 transition-all duration-300 ${currentStep >= 3 ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'} flex items-center justify-center font-extrabold mb-2 cursor-pointer`}>
              3
            </div>
            <p className={`text-sm ${currentStep >= 3 ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-500'} text-center cursor-pointer`}>ข้อมูลสุขภาพเบื้องต้น</p>
          </div>

        </div>

        <div>
          {currentStep === 1 && (
            <PersonalDetailsForm formData={formData} handleChange={handleChange} nextStep={nextStep} errors={errors} />
          )}
          {currentStep === 2 && (
            <AddressDetailsForm formData={formData} handleChange={handleChange} nextStep={nextStep} errors={errors} />
          )}
          {currentStep === 3 && (
            <HealthDetailsForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} errors={errors} />
          )}
        </div>

      </div>
    </div>
  );
}