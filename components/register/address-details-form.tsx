import type { FormRegisterData,FormErrors } from "@/lib/types"

export interface AddressDetailsFormProps {
  formData: FormRegisterData;
  // ใช้ Type จาก React สำหรับ Event handler
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  nextStep: () => void;
  errors : FormErrors;
}

export default function AddressDetailsForm({ formData, handleChange, nextStep, errors }: AddressDetailsFormProps) {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {/* Field: บ้านเลขที่ */}
      <div className="col-span-full">
        <label htmlFor="houseno" className="block text-sm font-medium mb-1">บ้านเลขที่</label>
        <input type="text" id="houseno" name="houseno" value={formData.houseno} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรุณากรอกที่อยู่" />
        {errors.houseno && (<p className="mt-1 text-sm text-red-500">{errors.houseno}</p>)}
      </div>
      {/* Field: ถนน */}
      <div className="col-span-full">
        <label htmlFor="road" className="block text-sm font-medium mb-1">ถนน</label>
        <input type="text" id="road" name="road" value={formData.road} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกชื่อถนน" />
      </div>
      {/* Field: ตำบล */}
      <div className="col-span-1">
        <label htmlFor="tambon" className="block text-sm font-medium mb-1">ตำบล</label>
        <input type="text" id="tambon" name="tambon" value={formData.tambon} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกตำบล" />
        {errors.tambon && (<p className="mt-1 text-sm text-red-500">{errors.tambon}</p>)}
      </div>

      {/* Field: อำเภอ */}
      <div className="col-span-1">
        <label htmlFor="ampur" className="block text-sm font-medium mb-1">อำเภอ</label>
        <input type="text" id="ampur" name="ampur" value={formData.ampur} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกอำเภอ" />
        {errors.ampur && (<p className="mt-1 text-sm text-red-500">{errors.ampur}</p>)}
      </div>

      {/* Field: จังหวัด */}
      <div className="col-span-1">
        <label htmlFor="changwat" className="block text-sm font-medium mb-1">จังหวัด</label>
        <input type="text" id="changwat" name="changwat" value={formData.changwat} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกจังหวัด" />
        {errors.changwat && (<p className="mt-1 text-sm text-red-500">{errors.changwat}</p>)}
      </div>

      {/* Field: หมู่ */}
      <div className="col-span-1">
        <label htmlFor="village" className="block text-sm font-medium mb-1">หมู่</label>
        <input type="text" id="village" name="village" value={formData.village} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกหมู่" />
      </div>

      {/* Field: เบอร์ติดต่อฉุกเฉิน */}
      <div className="col-span-full">
        <label htmlFor="emergency_phone_number" className="block text-sm font-medium mb-1">เบอร์ติดต่อฉุกเฉิน</label>
        <input type="text" id="emergency_phone_number" name="emergency_phone_number" value={formData.emergency_phone_number} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="เบอร์ติดต่อฉุกเฉิน" />
        {errors.emergency_phone_number && (<p className="mt-1 text-sm text-red-500">{errors.emergency_phone_number}</p>)}
      </div>

      
      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={nextStep} className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700">
          ถัดไป
        </button>
      </div>
    </form>
  );
}