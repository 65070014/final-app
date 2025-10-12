import Link from 'next/link';

export default function Banner() {
    return (
        <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-6 rounded-lg shadow flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-md text-center">
                    <Link href="/doctor/profile">
                        <div className="p-4 border rounded-lg hover:bg-gray-200 cursor-pointer">

                            <p className="font-medium text-[#012770]">ข้อมูลส่วนตัว</p>
                        </div>
                    </Link>

                    <Link href="/doctor/video_call/1">
                    <div className="p-4 border rounded-lg hover:bg-gray-200 cursor-pointer">
                        <p className="font-medium text-[#012770]">วิดีโอคอล</p>
                    </div>

                    </Link>
                    <Link href="/doctor/dispensing">
                        <div className="p-4 border rounded-lg hover:bg-gray-200 cursor-pointer">
                            <p className="font-medium text-[#012770]">การจ่ายยา</p>
                        </div>
                    </Link>
                    <Link href="/doctor/schedule">
                        <div className="p-4 border rounded-lg hover:bg-gray-200 cursor-pointer">

                            <p className="font-medium text-[#012770]">ตารางการนัดหมาย</p>

                        </div>
                    </Link>
                </div>
            </div>

            {/* Right Section */}
            <div className="bg-blue-100 p-6 rounded-lg shadow flex items-center justify-center">
                <p className="text-lg font-bold  text-center">
                    รูป
                </p>
            </div>
        </div>
    )
}
