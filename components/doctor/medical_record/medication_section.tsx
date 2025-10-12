"use client"

import { useEffect, useState } from "react"
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
import { Plus, Trash2, Pill, ChevronsUpDown, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface Medication {
  id: string
  name: string
  dosage: string
  usage: string
  quantity: string
  note: string
}

interface Medication_item {
  medication_id: number;
  medicine_name: string;
}

interface MedicationSectionProps {
  medications: Medication[]
  setMedications: (meds: Medication[]) => void
}

export function MedicationSection({ medications, setMedications }: MedicationSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMed, setNewMed] = useState({
    id: "",
    name: "",
    dosage: "",
    usage: "",
    quantity: "",
    note:""
  })
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication_item | null>(null);
  const [medicationsitem, setMedicationsItem] = useState<Medication_item[]>([]);
  const [searchQuery] = useState("");

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await fetch(`/api/medications`);
        const data = await res.json();
        setMedicationsItem(data);
      } catch (err) {
        console.error("Failed to fetch medications", err);
      }
    };

    const debounce = setTimeout(() => {
      fetchMedications();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.dosage || !newMed.usage || !newMed.quantity) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setMedications([...medications, newMed])
    setNewMed({ id: "", name: "", dosage: "", usage: "", quantity: "",note: "" })
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
            <DialogContent className="sm:max-w-[500px]"
              onInteractOutside={(e) => {
                const isClickInsidePopover = (e.target as HTMLElement).closest('.radix-popover-content');

                if (isClickInsidePopover) {
                  e.preventDefault();
                }
              }}>
              <DialogHeader>
                <DialogTitle>เพิ่มรายการยา</DialogTitle>
                <DialogDescription>ค้นหาและเลือกยาที่ต้องการสั่งให้ผู้ป่วย</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="med-name">ชื่อยา</Label>
                  <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        className="w-full justify-between font-normal text-left"
                      >
                        {selectedMedication ? selectedMedication.medicine_name : "เลือกยา..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[370px] p-0" >
                      <Command>
                        <CommandInput placeholder="พิมพ์เพื่อค้นหายา..." />
                        <CommandList>
                          <CommandEmpty>ไม่พบยาที่ค้นหา</CommandEmpty>
                          <CommandGroup>
                            {medicationsitem.map((med) => (
                              <CommandItem
                                key={med.medication_id}
                                value={med.medicine_name}
                                onSelect={() => {
                                  setNewMed(prevMed => ({
                                    ...prevMed,
                                    name: med.medicine_name,
                                    id: med.medication_id.toString(),
                                  }));
                                  setSelectedMedication(med);
                                  setPopoverOpen(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", selectedMedication?.medication_id === med.medication_id ? "opacity-100" : "opacity-0")} />
                                {med.medicine_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                <div>
                        <Label>หมายเหตุ (ถ้ามี)</Label>
                        <Textarea 
                            name="note" 
                            placeholder="เช่น ทานยาติดต่อกันจนหมด, หยุดยาหากมีอาการแพ้" 
                            value={newMed.note} 
                             onChange={(e) => setNewMed({ ...newMed, note: e.target.value })}
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
