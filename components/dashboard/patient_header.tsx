import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Weight} from "lucide-react"

export function PatientHeader() {
    return (
        <Card className="p-6 bg-gradient-to-r from-blue-500/5 to-blue-500/10 border-blue-500/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-blue-500/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-blue-500/10 text-blue-500 text-lg font-semibold">ศป</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">สวัสดีคุณศุภวิชญ์ ปัทมภาสสกุล</h1>
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
