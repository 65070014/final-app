import type { FormRegisterData } from "@/lib/types"

export interface PersonalDetailsFormProps {
  formData: FormRegisterData;
  // ใช้ Type จาก React สำหรับ Event handler
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> 
) => void; 
  nextStep: () => void;
}

export default function PersonalDetailsForm({ formData, handleChange, nextStep }:PersonalDetailsFormProps) {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      {/* Field: บัตรประชาชน */}
      <div className="col-span-full"> {/* ใช้ col-span-full เพื่อให้กินพื้นที่เต็ม Grid */}
        <label htmlFor="cid" className="block text-sm font-medium mb-1">หมายเลขบัตรประชาชน</label>
        <input type="text" id="cid" name="cid" value={formData.id} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรุณากรอกหมายเลขบัตรประชาชน 13 หลัก" />
      </div>
      {/* Field: ชื่อ */}
      <div className="col-span-1">
        <label htmlFor="firstName" className="block text-sm font-medium mb-1">ชื่อ</label>
        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกชื่อจริง" />
      </div>
      {/* Field: นามสกุล */}
      <div className="col-span-1">
        <label htmlFor="lastName" className="block text-sm font-medium mb-1">นามสกุล</label>
        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกนามสกุล" />
      </div>

      {/* Field: เพศ */}
      <div className="col-span-1">
      <label htmlFor="gender" className="block text-sm font-medium mb-1">เพศ</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">โปรดเลือก</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
          </select>
    </div>

      {/* Field: วันเดือนปีเกิด */}
      <div className="col-span-1">
        <label htmlFor="dob" className="block text-sm font-medium mb-1">วันเดือนปีเกิด</label>
        <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded-md" />
      </div>
      
      
      {/* Field: สัญชาติ */}
      <div className="col-span-1">
        <label htmlFor="nation" className="block text-sm font-medium mb-1">สัญชาติ</label>
        <input type="text" id="nation" name="nation" value={formData.nation} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="ระบุสัญชาติ" />
      </div>

      {/* Field: อาชีพ */}
      <div className="col-span-1">
        <label htmlFor="occupation" className="block text-sm font-medium mb-1">อาชีพ</label>
        <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="ระบุอาชีพ" />
      </div>

      {/* Field: เบอร์โทร */}
      <div className="col-span-1">
        <label htmlFor="phone_number" className="block text-sm font-medium mb-1">เบอร์โทรศัพท์</label>
        <input type="text" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="เบอร์โทรศัพท์" />
      </div>

      {/* Field: Email */}
      <div className="col-span-1"> {/* ใช้ col-span-full เพื่อให้กินพื้นที่เต็ม Grid */}
        <label htmlFor="email" className="block text-sm font-medium mb-1">อีเมล</label>
        <input type="text" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรุณากรอกอีเมล" />
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