"use client";

import { SetStateAction, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  password: '', confirm_password: '',
};

export default function PatientForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<FormRegisterData>(initialFormData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // ✅ ถ้าไม่มี Error ให้ล้าง Error เก่าออก แล้วไป Step ถัดไป
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const goToStep = (stepNumber: SetStateAction<number>) => {
    // ฟังก์ชันใหม่สำหรับเปลี่ยน Step โดยตรง
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
      const response = await fetch('/api/register', { // 👈 URL API ที่คุณสร้าง
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('ลงทะเบียนสำเร็จ:', result);
        alert('ลงทะเบียนผู้ป่วยสำเร็จ! ✅');
        router.push('/patient');
      } else {
        setErrors(result.errors || {});
        alert(`ลงทะเบียนไม่สำเร็จ: ${result.error}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      {/* Header Section */}

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">ลงทะเบียน</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">กรอกข้อมูล</p>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col items-center text-gray-400" onClick={() => goToStep(1)}>
            <div className={`w-10 h-10 rounded-full border-2 ${currentStep === 1 ? 'bg-blue-500 text-white' : 'border-gray-400 text-gray-400'} flex items-center justify-center font-bold mb-2 cursor-pointer`}>1</div>
            <p className={`text-sm ${currentStep === 1 ? 'text-blue-500' : ''}  font-medium text-center cursor-pointer`}>ข้อมูลส่วนตัว</p>
          </div>
          <div className="flex flex-col items-center text-gray-400" onClick={() => goToStep(2)}>
            <div className={`w-10 h-10 rounded-full border-2 ${currentStep === 2 ? 'bg-blue-500 text-white' : 'border-gray-400 text-gray-400'} flex items-center justify-center font-bold mb-2 cursor-pointer`}>2</div>
            <p className={`text-sm ${currentStep === 2 ? 'text-blue-500' : ''}  text-center cursor-pointer`}>ข้อมูลที่อยู่</p>
          </div>
          <div className="flex flex-col items-center text-gray-400 " onClick={() => goToStep(3)}>
            <div className={`w-10 h-10 rounded-full border-2 ${currentStep === 3 ? 'bg-blue-500 text-white' : 'border-gray-400 text-gray-400'} flex items-center justify-center font-bold mb-2 cursor-pointer`}>3</div>
            <p className={`text-sm ${currentStep === 3 ? 'text-blue-500' : ''}  text-center cursor-pointer`}>ข้อมูลสุขภาพเบื้องต้น</p>
          </div>
        </div>
        {/* The actual form component */}
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