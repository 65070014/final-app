import { AllNotify } from "@/components/history/notify_history"

export default function NotificationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">การแจ้งเตือน</h1>
        <AllNotify />
      </div>
    </div>
  )
}
