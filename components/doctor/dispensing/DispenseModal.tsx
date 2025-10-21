"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Medication {
    medication_id: number;
    medicine_name: string;
    strength: string;
}

interface DispenseModalProps {
    open: boolean
    onClose: () => void
    patientId: number
    medicalPersonnelId: number
    appointmentId: number
    onSuccess: () => void
}

export default function DispenseModal({ open, onClose, patientId, medicalPersonnelId, appointmentId, onSuccess }: DispenseModalProps) {
    const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [form, setForm] = useState({
        dosage: "",
        unit: "",
        usage: "",
        quantity: "",
        duration: "",
        note: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    useEffect(() => {
        const dosageNum = parseFloat(form.dosage) || 0;
        const frequencyNum = parseInt(form.usage) || 0;
        const durationNum = parseInt(form.duration) || 0;

        const total = dosageNum * frequencyNum * durationNum;
        setForm(prev => ({ ...prev, quantity: total.toString() }));
    }, [form.dosage, form.usage, form.duration]);

    useEffect(() => {
        const fetchMedications = async () => {
            if (!open) return;
            try {
                const res = await fetch(`/api/medications`);
                if (!res.ok) throw new Error("Network response was not ok");
                const data = await res.json();
                setMedications(data);
            } catch (err) {
                console.error("Failed to fetch medications", err);
                setError("ไม่สามารถโหลดรายการยาได้");
            }
        };
        fetchMedications();
    }, [open]);

    const handleClose = () => {
        setSelectedMedication(null);
        setForm({ dosage: "", usage: "", quantity: "", note: "", duration: "", unit: "" });
        setError(null);
        setIsSubmitting(false);
        setPopoverOpen(false);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async () => {
        if (!selectedMedication) {
            setError("กรุณาเลือกยาจากรายการ");
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const payload = {
            ...form,
            patientId,
            medicalPersonnelId,
            appointmentId,
            medicationId: selectedMedication.medication_id,
        };

        try {
            const res = await fetch("/api/prescription_medication", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || errorData.message || 'เกิดข้อผิดพลาด');
                } catch {
                    throw new Error(errorText);
                }
            }

            onSuccess();
            handleClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent
                className="max-w-md"
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>เพิ่มรายการยา</DialogTitle>
                    <p className="text-sm text-gray-400">ค้นหาและเลือกยาที่ต้องการสั่งให้ผู้ป่วย</p>
                </DialogHeader>

                <div className="space-y-3">
                    <div>
                        <Label>ชื่อยา</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between font-normal text-left"
                                >
                                    {selectedMedication ? `${selectedMedication.medicine_name}${selectedMedication.strength ? ` (${selectedMedication.strength})` : ""}` : "เลือกยา..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[370px] p-0">
                                <Command>
                                    <CommandInput placeholder="พิมพ์เพื่อค้นหายา..." />
                                    <CommandList>
                                        <CommandEmpty>ไม่พบยาที่ค้นหา</CommandEmpty>
                                        <CommandGroup>
                                            {medications.map((med) => (
                                                <CommandItem
                                                    key={med.medication_id}
                                                    value={String(med.medication_id)}
                                                    onSelect={() => {
                                                        setSelectedMedication(med);
                                                        setPopoverOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", selectedMedication?.medication_id === med.medication_id ? "opacity-100" : "opacity-0")} />
                                                    {med.medicine_name} {med.strength ? `(${med.strength})` : null}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* ป้อนค่าตัวเลขขนาดยา */}
                        <div className="flex-1">
                            <Label htmlFor="dosage">ขนาดยา (Dosage)</Label>
                            <Input
                                id="dosage"
                                type="number"
                                name="dosage"
                                placeholder="เช่น 1"
                                value={form.dosage}
                                onChange={handleChange}
                            />
                        </div>

                        {/* เลือกหน่วยยา */}
                        <div className="w-32">
                            <Label htmlFor="unit">หน่วย</Label>
                            <select
                                id="unit"
                                name="unit"
                                className="border rounded-md w-full p-2"
                                value={form.unit}
                                onChange={handleChange}
                            >
                                <option value="">เลือกหน่วย</option>
                                <option value="เม็ด">เม็ด</option>
                                <option value="แคปซูล">แคปซูล</option>
                                <option value="ml">มิลลิลิตร (ml)</option>
                                <option value="ช้อนชา">ช้อนชา</option>
                                <option value="ช้อนโต๊ะ">ช้อนโต๊ะ</option>
                                <option value="หลอด">หลอด</option>
                                <option value="ขวด">ขวด</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <Label>วิธีการใช้ (Usage)</Label>
                        <Input name="usage" placeholder="เช่น วันละ 3 ครั้ง หลังอาหาร" value={form.usage} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>ระยะเวลา</Label>
                        <Input name="duration" placeholder="เช่น 5 วัน" value={form.duration} onChange={handleChange} />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <Label>จำนวนที่จ่าย</Label>
                            <Input name="quantity" placeholder="เช่น 30" value={form.quantity} readOnly />
                        </div>
                        <div className="flext-2">
                            <Label>หน่วยที่จ่าย</Label>
                            <Input name="unit" placeholder="เช่น เม็ด" value={form.unit} readOnly />
                        </div>

                    </div>
                    <div>
                        <Label>หมายเหตุ (ถ้ามี)</Label>
                        <Textarea
                            name="note"
                            placeholder="เช่น ทานยาติดต่อกันจนหมด"
                            value={form.note}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center pt-2">{error}</p>}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>ยกเลิก</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มยา'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}