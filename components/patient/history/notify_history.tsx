"use client"

import { Card } from "@/components/ui/card"
import { Clock, AlertTriangle, Package, Calendar, Stethoscope } from "lucide-react"
import { Button } from "../../ui/button"
import Link from "next/link";


export function AllNotify() {
  const notifications = [
    {
      type: "Daily Vitals Reminder",
      title: "เตือน: บันทึกข้อมูลสุขภาพประจำวัน",
      message: "อย่าลืมบันทึกสัญญาณชีพ (ความดัน, น้ำหนัก) ประจำวันนี้ เพื่อส่งให้แพทย์ติดตามอาการ",
      date: "วันนี้",
      time: "08:00 น.",
      action: "บันทึกตอนนี้",
      path: "/patient/vitals_track",
      icon: <Stethoscope className="h-5 w-5 text-green-500" />,
    },
    {
      type: "Health Data Alert",
      title: "ข้อมูลสุขภาพยังไม่สมบูรณ์!",
      message: "กรุณากรอกข้อมูลสุขภาพให้ครบถ้วนก่อนพบแพทย์",
      date: "วันนี้",
      time: "10:00 น.",
      action: "กรอกข้อมูล",
      path: "/patient/notification",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    },
    {
      type: "Medication Status",
      title: "แจ้งเตือนสถานะยา",
      message: "ยาที่สั่งเมื่อวานนี้ กำลังถูกจัดส่ง",
      date: "1 ต.ค. 2568",
      time: "08:30 น.",
      action: "ติดตามพัสดุ",
      path: "/patient/notification",
      icon: <Package className="h-5 w-5 text-blue-500" />,
    },
    {
      type: "Appointment Reminder",
      title: "เตือน: นัดหมายแพทย์พรุ่งนี้",
      message: "คุณมีนัดกับ นพ. สมชาย ใจดี วันพรุ่งนี้ เวลา 10:30 น.",
      date: "30 ก.ย. 2568",
      time: "18:00 น.",
      action: "ดูรายละเอียด",
      path: "/patient/notification",
      icon: <Calendar className="h-5 w-5 text-green-500" />,
    },
  ];

  return (
    <div className="space-y-4">
      {notifications.map((notif, index) => (
        <Card key={index} className="p-4 space-y-2 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-start gap-3 flex-shrink-0">
                {notif.icon} {/* แสดงไอคอนที่เหมาะสมกับประเภทการแจ้งเตือน */}
            </div>
            
            <div className="flex-grow space-y-1">
                <h2 className={"font-bold text-lg"}>{notif.title}</h2>
                
                <p className="text-sm text-gray-700">{notif.message}</p>

                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3" />
                  {notif.date} เวลา {notif.time}
                </div>
            </div>
          </div>
          
          <div className="pt-2 text-right">
            <Link href ={notif.path}>
              <Button variant="default" size="sm" className="w-auto">
                {notif.action}
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}