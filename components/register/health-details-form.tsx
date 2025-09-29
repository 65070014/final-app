export default function HealthDetailsForm({ formData, handleChange, nextStep }) {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Field: กรุ๊ปเลือด */}
      <div className="col-span-full">
        <label htmlFor="bloodType" className="block text-sm font-medium mb-1">กรุ๊ปเลือด</label>
        <select 
          id="bloodType" 
          name="bloodType" 
          value={formData.bloodType}
          onChange={handleChange} 
          className="w-full p-2 border rounded-md"
        >
          <option>โปรดเลือก</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="AB">AB</option>
          <option value="O">O</option>
          <option value="UN">ไม่ทราบ</option>
        </select>
      </div>

      {/* Field: น้ำหนัก */}
      <div className="col-span-1">
        <label htmlFor="weight" className="block text-sm font-medium mb-1">น้ำหนัก</label>
        <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกน้ำหนัก (กก.)" />
      </div>
      {/* Field: ส่วนสูง */}
      <div className="col-span-1">
        <label htmlFor="height" className="block text-sm font-medium mb-1">ส่วนสูง</label>
        <input type="number" id="height" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกส่วนสูง (ซม.)" />
      </div>

      {/* Field: โรคประจำตัว */}
      <div className="col-span-full"> {/* ใช้ col-span-full เพื่อให้กินพื้นที่เต็ม Grid */}
        <label htmlFor="underlying_disease" className="block text-sm font-medium mb-1">โรคประจำตัว</label>
        <input type="text" id="underlying_disease" name="underlying_disease" value={formData.underlying_disease} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรุณากรอกโรคประจำตัว" />
      </div>
      {/* Field: การแพ้ยา */}
      <div className="col-span-full">
        <label htmlFor="drugallergy" className="block text-sm font-medium mb-1">การแพ้ยา/อาหาร</label>
        <input type="text" id="drugallergy" name="drugallergy" value={formData.drugallergy} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกการแพ้ยา" />
      </div>
      
      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={nextStep} className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700">
          ยืนยัน
        </button>
      </div>
    </form>
  );
}