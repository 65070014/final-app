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

      {/* Field: โรคประจำตัว */}
      <div className="col-span-full"> {/* ใช้ col-span-full เพื่อให้กินพื้นที่เต็ม Grid */}
        <label htmlFor="underlying_disease" className="block text-sm font-medium mb-1">โรคประจำตัว</label>
        <input type="text" id="underlying_disease" name="underlying_disease" value={formData.underlying_disease} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรุณากรอกโรคประจำตัว" />
      </div>
      {/* Field: โรคทางพันธุกรรม */}
      <div className="col-span-full">
        <label htmlFor="genetic_disease" className="block text-sm font-medium mb-1">โรคทางพันธุกรรม</label>
        <input type="text" id="genetic_disease" name="genetic_disease" value={formData.genetic_disease} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="กรอกโรคทางพันธุกรรม" />
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