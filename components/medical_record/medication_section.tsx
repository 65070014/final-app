"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Pill } from "lucide-react"

interface Medication {
  id: string
  name: string
  dosage: string
  usage: string
  quantity: string
}

interface MedicationSectionProps {
  medications: Medication[]
  setMedications: (meds: Medication[]) => void
}

export function MedicationSection({ medications, setMedications }: MedicationSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    usage: "",
    quantity: "",
  })

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.dosage || !newMed.usage || !newMed.quantity) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMed,
    }

    setMedications([...medications, medication])
    setNewMed({ name: "", dosage: "", usage: "", quantity: "" })
    setIsDialogOpen(false)
  }

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            การจ่ายยา
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มยา
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>เพิ่มรายการยา</DialogTitle>
                <DialogDescription>กรอกข้อมูลยาที่ต้องการสั่งให้ผู้ป่วย</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="med-name">ชื่อยา</Label>
                  <Input
                    id="med-name"
                    placeholder="เช่น Paracetamol"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-dosage">ขนาด/ความแรง</Label>
                  <Input
                    id="med-dosage"
                    placeholder="เช่น 500 mg"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-usage">วิธีการใช้</Label>
                  <Input
                    id="med-usage"
                    placeholder="เช่น วันละ 3 ครั้ง หลังอาหาร"
                    value={newMed.usage}
                    onChange={(e) => setNewMed({ ...newMed, usage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="med-quantity">จำนวนที่จ่าย</Label>
                  <Input
                    id="med-quantity"
                    placeholder="เช่น 30 เม็ด"
                    value={newMed.quantity}
                    onChange={(e) => setNewMed({ ...newMed, quantity: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddMedication}>เพิ่มยา</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>ยังไม่มีรายการยา</p>
            <p className="text-sm">คลิกปุ่ม &quot;เพิ่มยา&quot; เพื่อเพิ่มรายการยา</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>ขนาด/ความแรง</TableHead>
                  <TableHead>วิธีการใช้</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.usage}</TableCell>
                    <TableCell>{med.quantity}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedication(med.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
