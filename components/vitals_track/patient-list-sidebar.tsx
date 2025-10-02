"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import type { Patient } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PatientListSidebarProps {
  patients: Patient[]
  selectedPatientId: string | null
  onSelectPatient: (patientId: string) => void
}


export function PatientListSidebar({ patients, selectedPatientId, onSelectPatient }: PatientListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = patients.filter((patient) => {
    // Search filter
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.id.includes(searchQuery)


    return matchesSearch
  })

  {/*const getDaysRemaining = (endDate: Date) => {
    const days = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }*/}

  return (
    <div className="flex h-screen w-80 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold text-foreground">รายชื่อผู้ป่วย</h2>
        <p className="text-sm text-muted-foreground">{filteredPatients.length} ผู้ป่วยที่กำลังติดตาม</p>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อหรือรหัสผู้ป่วย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>


      {/* Patient List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {filteredPatients.map((patient) => {
            {/*const daysRemaining = getDaysRemaining(patient.monitoringEndDate)*/}
            const isSelected = patient.id === selectedPatientId

            return (
              <button
                key={patient.id}
                onClick={() => onSelectPatient(patient.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-accent",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{patient.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      อายุ {patient.age} ปี • ID: {patient.id}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {patient.chronicConditions.slice(0, 2).map((condition, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                  {patient.chronicConditions.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{patient.chronicConditions.length - 2}
                    </Badge>
                  )}
                </div>
                {/*<div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {daysRemaining > 0 ? `เหลืออีก ${daysRemaining} วัน` : `เกินกำหนด ${Math.abs(daysRemaining)} วัน`}
                  </span>
                </div>*/}
                
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
