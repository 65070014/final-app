import Image from 'next/image';
import '../appointment_history/style.css';

export default function AppointmentHistory() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 shadow">
                <div className="flex items-center gap-8">
                    <div className="font-bold text-lg text-[#0257F5]">โลโก้</div>
                    <nav className="flex gap-6 text-sm">
                        <a href="#" className="hover:underline">หน้าแรก</a>
                        <a href="#" className="hover:underline">บริการของเรา</a>
                        <a href="#" className="hover:underline">แพทย์ผู้เชี่ยวชาญ</a>
                        <a href="#" className="hover:underline">ติดต่อเรา</a>
                    </nav>
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </header>

            {/* Banner */}
            <div className="relative w-full h-72 md:h-96"style={{
    backgroundImage: "url('https://image.bangkokbiznews.com/uploads/images/md/2024/11/3Vc9BUxS99eo9i2cNQrR.webp?x-image-process=style/LG')",
    backgroundPosition: "center 20px",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    backgroundAttachment: "fixed",
  }}>
            </div>

            <h1 className="text-2xl font-bold text-center  my-8">
                <strong>ประวัติการนัดหมาย</strong>
            </h1>

            <div className="flex max-w-5xl mx-auto px-4">
                <aside className="w-1/4 border rounded p-4 space-y-4">
                    <a href="#" className="block hover:underline text-[#012770] p-2">ข้อมูลของฉัน</a>
                    <a href="#" className="block font-bold p-2 text-[#0257F5]">ประวัติการนัดหมาย</a>
                    <a href="#" className="block hover:underline text-[#012770] p-2">ออกจากระบบ</a>
                </aside>

                {/* Appointment Card */}
                <main className="w-3/4 pl-6 ">
                    <div className="border rounded shadow-sm p-2">
                        <h2 className="font-bold mb-4"><strong>1. ร.พ. ลาดกระบัง</strong></h2>
                        <div className='px-4'>
                            <p>รูปแบบการนัดหมาย: วิดีโอคอล</p>
                            <p>วัน-เวลา: วันจันทร์ที่ 19 สิงหาคม เวลา 18.00-19.00 น.</p>
                            <p>ผู้ป่วย: นาย ก้อง ภพ</p>
                            <p>แพทย์: นพ.ภัทร วงษ์นรา</p>
                            <p>แผนก: ศูนย์ศัลยกรรมโรคหัวใจ</p>
                            <p>การชำระเงิน: -</p>
                            <p>ข้อมูลวินิจฉัย: กล้ามเนื้อหัวใจอักเสบ</p>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
