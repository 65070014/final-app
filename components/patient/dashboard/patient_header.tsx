"use client";

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Weight} from "lucide-react"
import { useSession } from "next-auth/react"; 


export function PatientHeader() {
    const { data: session } = useSession();

    return (
        <Card className="p-6 bg-gradient-to-r from-blue-100 to-blue-50 border-blue-25 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-blue-25">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-50 text-blue-500 text-lg font-semibold">ศป</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">สวัสดี{session?.user?.name || 'ผู้ใช้'}</h1>
                        <p className="text-muted-foreground">ผู้ป่วยเลขที่: HN-2025-000001</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <Weight className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-muted-foreground">น้ำหนักล่าสุด</span>
                        </div>
                        <p className="text-xl font-semibold text-foreground">72.5 กก.</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <Heart className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-muted-foreground">ความดันโลหิตล่าสุด</span>
                        </div>
                        <p className="text-xl font-semibold text-foreground">120/80</p>
                    </div>
                </div>
            </div>
        </Card>
    )
}
