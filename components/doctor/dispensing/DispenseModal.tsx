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
        usage: "",
        quantity: "",
        note: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

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
        setForm({ dosage: "", usage: "", quantity: "", note: "" });
        setError(null);
        setIsSubmitting(false);
        setPopoverOpen(false);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
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
                                    {selectedMedication ? selectedMedication.medicine_name : "เลือกยา..."}
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
                                                    value={med.medicine_name}
                                                    onSelect={() => {
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
                    <div>
                        <Label>วิธีการใช้ (Usage)</Label>
                        <Input name="usage" placeholder="เช่น วันละ 3 ครั้ง หลังอาหาร" value={form.usage} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>จำนวนที่จ่าย</Label>
                        <Input name="quantity" type="number" placeholder="เช่น 30" value={form.quantity} onChange={handleChange} />
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