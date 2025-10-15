"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TreatmentCardProps {
  department: string;
  date: string;
  time: string;
  doctorname: string;
  diag_name: string;
  status: string;
}

export function TreatmentCard({
  department,
  date,
  time,
  doctorname,
  diag_name,
  status,
}: TreatmentCardProps) {
  const color =
    status === "เสร็จสิ้น"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <Card className="shadow-sm border rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          {department}
        </CardTitle>
        <Badge className={color}>{status}</Badge>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 space-y-1">
        <p><span className="font-medium">วันที่:</span> {date} ({time})</p>
        <p><span className="font-medium">แพทย์ผู้ตรวจ:</span> {doctorname}</p>
        <p><span className="font-medium">การวินิจฉัย:</span> {diag_name}</p>
      </CardContent>
    </Card>
  );
}
