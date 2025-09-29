import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Pill, FileText, AlertCircle, Bell } from "lucide-react"

export function ActionZone() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* การนัดหมาย */}
            <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Calendar className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">นัดหมายครั้งถัดไป</h3>
                        </div>
                    </div>

                    <div className="bg-card p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-medium text-foreground">วันพุธที่ 1 ตุลาคม 2568</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    เวลา 10:00 น. - พบแพทย์หญิงสุดา
                                </p>
                            </div>
                        </div>
                        <Button className="w-full bg-gray-400 text-gray-700 cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-700 disabled:opacity-100 mb-2" disabled >เข้าร่วมวิดีโอคอล</Button>
                        <Button className="w-full bg-red-600 hover:bg-red-700">เลื่อน/ยกเลิกนัด</Button>
                    </div>
                </div>
            </Card>

            {/* การแจ้งเตือน */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Bell className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">การแจ้งเตือน</h3>
                    </div>

                    <Alert className="border-orange-200 bg-orange-50 flex items-start pl-6">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 text-left">
                            <strong>ข้อมูลสุขภาพยังไม่สมบูรณ์! :</strong> กรุณากรอกข้อมูลสุขภาพให้ครบถ้วนก่อนพบแพทย์
                        </AlertDescription>
                    </Alert>

                    <Alert className="border-blue-200 bg-blue-50 flex items-start pl-6">
                        <Pill className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-left">
                            <strong>แจ้งเตือนสถานะยา:</strong> ยาที่สั่งเมื่อวานนี้ กำลังถูกจัดส่ง
                        </AlertDescription>
                    </Alert>

                    <Button variant="outline" className="w-full">
                        ดูการแจ้งเตือนทั้งหมด
                    </Button>
                </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">บริการด่วน</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">จองนัดหมาย</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                        <Pill className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">รายการยา</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                        <Calendar className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">ผลตรวจ</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                        <Clock className="h-6 w-6 text-blue-500" />
                        <span className="text-sm">ประวัติการรักษา</span>
                    </Button>
                </div>
            </Card>
        </div>
    )
}
