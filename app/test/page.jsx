"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email) {
      alert("กรุณากรอกอีเมลปลายทางก่อนครับ");
      return;
    }

    setIsLoading(true);
    setStatus("กำลังส่งอีเมล... ⏳");

    try {
      // เรียก API ที่เราเพิ่งสร้างไป
      const response = await fetch("/api/email_notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "🎉 ทดสอบระบบแจ้งเตือน Telemedicine",
          message: "ยินดีด้วยครับ! ระบบส่งอีเมลของคุณเชื่อมต่อสำเร็จแล้ว เตรียมพร้อมสำหรับรับผู้ป่วยได้เลย 🏥",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("✅ ส่งอีเมลสำเร็จ! ลองเช็ค Inbox ดูครับ");
      } else {
        setStatus("❌ ส่งไม่ผ่าน: " + data.error);
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          ทดสอบส่ง Email
        </h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            ส่งไปที่อีเมล:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <button
          onClick={handleSendEmail}
          disabled={isLoading}
          className={`w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "กำลังส่ง..." : "🚀 กดส่ง Email"}
        </button>

        {status && (
          <div className="mt-4 text-center font-medium text-gray-800">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}