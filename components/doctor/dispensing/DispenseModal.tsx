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
}

export default function DispenseModal({ open, onClose, patientId, medicalPersonnelId }: DispenseModalProps) {
    const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [medications, setMedications] = useState<Medication[]>([]);

    const [form, setForm] = useState({
        strength: "",
        usage: "",
        quantity: "",
        note: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                const res = await fetch(`/api/medications`);
                const data = await res.json();
                setMedications(data);
            } catch (err) {
                console.error("Failed to fetch medications", err);
            }
        };

        const debounce = setTimeout(() => {
            fetchMedications();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleClose = () => {
        setSelectedMedication(null);
        setForm({ strength: "", usage: "", quantity: "", note: "" });
        setError(null);
        setIsSubmitting(false);
        onClose();
    };
    
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        if (!selectedMedication) {
            setError("กรุณาเลือกยาจากรายการ");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...form,
            patientId,
            medicalPersonnelId,
            medicationId: selectedMedication.medication_id,
        };

        try {
            const res = await fetch("/api/prescription_medication", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'เกิดข้อผิดพลาด');
            }

            handleClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent onPointerDownOutside={(e) => e.preventDefault()} className="max-w-md">
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
                                    aria-expanded={popoverOpen}
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
                                                    <Check className={cn("mr-2 h-4 w-4", selectedMedication?.medication_id === med.medication_id ? "opacity-100" : "opacity-0")}/>
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
                        <Label>ขนาด/ความแรง</Label>
                        <Input name="strength" placeholder="เช่น 500 mg (ถ้ามี)" value={form.strength} onChange={handleChange}/>
                    </div>
                    <div>
                        <Label>วิธีการใช้</Label>
                        <Input name="usage" placeholder="เช่น วันละ 3 ครั้ง หลังอาหาร" value={form.usage} onChange={handleChange}/>
                    </div>
                    <div>
                        <Label>จำนวนที่จ่าย</Label>
                        <Input name="quantity" placeholder="เช่น 30 เม็ด" value={form.quantity} onChange={handleChange}/>
                    </div>
                    <div>
                        <Label>หมายเหตุ (ถ้ามี)</Label>
                        <Textarea 
                            name="note" 
                            placeholder="เช่น ทานยาติดต่อกันจนหมด, หยุดยาหากมีอาการแพ้" 
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
