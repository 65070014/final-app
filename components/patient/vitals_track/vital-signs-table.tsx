"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { VitalRecord } from "@/lib/types"

type VitalSignsTableProps = {
  records: VitalRecord[]
}

export function VitalSignsTable({ records }: VitalSignsTableProps) {
  const getBloodPressureStatus = (systolic?: number, diastolic?: number) => {
    if (!systolic || !diastolic) return null

    if (systolic < 120 && diastolic < 80) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success">
          ปกติ
        </Badge>
      )
    } else if (systolic >= 140 || diastolic >= 90) {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
          สูง
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
          ค่อนข้างสูง
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ประวัติการบันทึก</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>เวลา</TableHead>
              <TableHead>ความดัน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>น้ำหนัก</TableHead>
              <TableHead>น้ำตาล</TableHead>
              <TableHead>หมายเหตุ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  ยังไม่มีข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {new Date(record.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{record.date}{record.time}</TableCell>
                  <TableCell>
                    {record.systolic && record.diastolic ? `${record.systolic}/${record.diastolic}` : "-"}
                  </TableCell>
                  <TableCell>{getBloodPressureStatus(record.systolic, record.diastolic) || "-"}</TableCell>
                  <TableCell>{record.weight ? `${record.weight} กก.` : "-"}</TableCell>
                  <TableCell>{record.temp ? `${record.temp} °C` : "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
