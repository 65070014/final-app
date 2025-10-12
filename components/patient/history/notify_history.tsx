"use client"

import { Card } from "@/components/ui/card"
import { Clock, LucideIcon } from "lucide-react"
import { Button } from "../../ui/button"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Notification } from "@/lib/types";
import { notificationMap } from '@/utils/notificationMapping';

interface NotifWithConfig {
  title: string;
  message_text: string;
  create_at: string;
  linkUrl?: string;

  action: string;
  IconComponent: LucideIcon;
  iconColor: string;
}

export function AllNotify() {
  const [notification, setnotification] = useState<Notification[]>([])
  const { data: session, status } = useSession();
  const [, setError] = useState<string | null>(null);
  const [isLoadingNotification, setIsLoadingNotification] = useState(true);


  useEffect(() => {
    async function fetchNotification() {
      if (status !== 'authenticated' || !session?.user?.id) {
        if (status !== 'loading') {
          setIsLoadingNotification(false);
        }
        return;
      }

      setIsLoadingNotification(true);
      setError(null);

      try {
        const patientId = session.user.id;
        const response = await fetch(`/api/notification?id=${patientId}&role=Patient`);

        if (!response.ok) {
          throw new Error('ไม่สามารถดึงรายการนัดหมายได้');
        }

        const data = await response.json();
        setnotification(data);
        console.log(data)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching appointments:", error);
        setError(error.message);
      } finally {
        setIsLoadingNotification(false);
      }
    }
    if (status === 'authenticated') {
      fetchNotification();
    }

  }, [session, status]);

  const notificationsToRender: NotifWithConfig[] = notification.map(notif => {
    const config = notificationMap[notif.notification_type] || {
      title: 'แจ้งเตือนทั่วไป',
      icon: Clock, // Icon สำรอง
      iconColor: 'text-gray-500',
      action: 'ข้อมูลเพิ่มเติม'
    };

    return {
      ...notif,
      title: config.title,
      IconComponent: config.icon,
      iconColor: config.iconColor,
      action: config.action
    };
  });

  return (
    <div className="space-y-4">
      {isLoadingNotification ? (
        <p className="text-center text-gray-500 py-10">กำลังโหลดรายการนัดหมาย...</p>
      ) : (
        <>
          {
            notificationsToRender.map((notif, index) => (
              <Card key={index} className="p-4 space-y-2 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <notif.IconComponent className={`h-5 w-5 ${notif.iconColor}`} /> 
                  </div>

                  <div className="flex-grow space-y-1">
                    <h2 className={"font-bold text-lg"}>{notif.title}</h2>

                    <p className="text-sm text-gray-700">{notif.message_text}</p>

                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      {notif.create_at}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <Link href='{notif.linkUrl}'>
                    <Button variant="default" size="sm" className="w-auto">
                      {notif.action}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          }
        </>
      )}
    </div>
  );
}