"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from 'lucide-react';
import { Notification } from "@/lib/types";
import { notificationMap } from '@/utils/notificationMapping';

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "เมื่อสักครู่";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชม. ที่แล้ว`;
  return new Intl.DateTimeFormat('th-TH', { month: 'short', day: 'numeric' }).format(date);
};

export function NotificationPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchNotification() {
      if (status !== 'authenticated' || !session?.user?.id) return;

      try {
        const patientId = session.user.id;
        const response = await fetch(`/api/notification?id=${patientId}&role=Patient&t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotification();

    const interval = setInterval(fetchNotification, 60000);
    return () => clearInterval(interval);

  }, [session, status]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`
      w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left
      text-gray-600 hover:bg-gray-50 outline-none
    `}
        >
          <div className="relative flex items-center justify-center">
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </div>

          <span className="font-medium">การแจ้งเตือน</span>
          {unreadCount > 0 && (
            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 shadow-xl border-slate-200" align="end">

        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
          <h4 className="font-semibold text-sm text-slate-800">การแจ้งเตือน</h4>
          {unreadCount > 0 && (
            <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
              {unreadCount} ใหม่
            </span>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-xs">กำลังอัปเดต...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs">ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif, index) => {
                const config = notificationMap[notif.notification_type] || {
                  icon: Bell, iconColor: 'text-gray-400'
                };
                const Icon = config.icon;

                return (
                  <div
                    key={notif.notification_id || index}
                    className={`px-4 py-3 hover:bg-blue-50/50 transition-colors flex gap-3 items-start group relative ${!notif.is_read ? 'bg-blue-50/20' : ''}`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-full bg-gray-100 shrink-0 ${config.iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm leading-tight ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notificationMap[notif.notification_type]?.title || "แจ้งเตือน"}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {formatTimeAgo(notif.create_at)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2">
                        {notif.message_text}
                      </p>

                      {notif.linkUrl && (
                        <Link
                          href={notif.linkUrl}
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-medium text-blue-600 hover:underline mt-1 inline-block"
                        >
                          {notificationMap[notif.notification_type]?.action || "ดูรายละเอียด"}
                        </Link>
                      )}
                    </div>

                    {!notif.is_read && (
                      <div className="absolute top-4 right-2 h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-gray-100 bg-gray-50/50">
          <Link href="/patient/notification" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full text-xs h-8 text-gray-500 hover:text-blue-600 hover:bg-white">
              ดูทั้งหมด
            </Button>
          </Link>
        </div>

      </PopoverContent>
    </Popover>
  );
}