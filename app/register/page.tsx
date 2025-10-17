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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8 flex items-center justify-center">

      {/* Main Card Container: เพิ่มความกว้างและมิติ */}
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">

        {/* Title Section */}
        <div className="text-center mb-12 border-b pb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
            ลงทะเบียนผู้ป่วยใหม่
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400">
            กรอกข้อมูลส่วนตัว ที่อยู่ และข้อมูลสุขภาพเบื้องต้นตามขั้นตอน
          </p>
        </div>

        {/* Step Indicator Section: ใช้โครงสร้างเดิมแต่ปรับ Class ให้เด่นชัด */}
        <div className="grid grid-cols-3 gap-6 mb-12 relative after:absolute after:top-1/4 after:left-0 after:right-0 after:h-0.5 after:bg-gray-200 dark:after:bg-gray-700 after:z-0">

          {/* Step 1 */}
          <div className="flex flex-col items-center z-10" onClick={() => goToStep(1)}>
            <div
              className={`
                        w-10 h-10 rounded-full border-4 transition-all duration-300
                        ${currentStep >= 1
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'} 
                        flex items-center justify-center font-extrabold mb-2 cursor-pointer
                    `}
            >
              1
            </div>
            <p
              className={`text-sm ${currentStep >= 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500'} text-center cursor-pointer`}
            >
              ข้อมูลส่วนตัว
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10" onClick={() => goToStep(2)}>
            <div
              className={`
                        w-10 h-10 rounded-full border-4 transition-all duration-300
                        ${currentStep >= 2
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'} 
                        flex items-center justify-center font-extrabold mb-2 cursor-pointer
                    `}
            >
              2
            </div>
            <p
              className={`text-sm ${currentStep >= 2 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500'} text-center cursor-pointer`}
            >
              ข้อมูลที่อยู่
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10" onClick={() => goToStep(3)}>
            <div
              className={`
                        w-10 h-10 rounded-full border-4 transition-all duration-300
                        ${currentStep >= 3
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'} 
                        flex items-center justify-center font-extrabold mb-2 cursor-pointer
                    `}
            >
              3
            </div>
            <p
              className={`text-sm ${currentStep >= 3 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500'} text-center cursor-pointer`}
            >
              ข้อมูลสุขภาพเบื้องต้น
            </p>
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