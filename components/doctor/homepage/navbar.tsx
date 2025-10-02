export default function Navbar() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
        <div className="font-bold text-xl">🏥 โลโก้</div>
        <ul className="flex gap-6 text-gray-700">
          <li><a href="/doctor">หน้าแรก</a></li>
          <li><a href="/doctor/record_treatment">บริการตรวจ</a></li>
          <li><a href="/doctor/vitals_track">ติดตามอาการ</a></li>
          <li><a href="#">แพทย์ผู้เชี่ยวชาญ</a></li>
          <li><a href="#">ติดต่อเรา</a></li>
        </ul>
      </div>
    </nav>
  )
}
