import { XCircle, Bell, Clock, LucideIcon, Pill, HeartPulse, CalendarCheck } from 'lucide-react';


const getTailwindClasses = (colorClass: string) => {
    const baseColor = colorClass.split('-')[1];

    return {
        backgroundColor: `border-${baseColor}-200 bg-${baseColor}-50`,
        iconColor: `text-${baseColor}-600`,
        descriptionColor: `text-${baseColor}-800`,
    };
};

export interface NotificationProps {
    title: string;
    color: string;
    icon: LucideIcon;
    backgroundColor: string;
    iconColor: string;
    descriptionColor: string;
    action: string
}


export const notificationMap: Record<string, NotificationProps> = {
    'appointment_cancelled': {
        title: 'นัดหมายถูกยกเลิก',
        color: 'text-red-500',
        icon: XCircle,
        action: 'ดูรายละเอียด',
        ...getTailwindClasses('text-red-500')
    },
    'appointment_reminder': {
        title: 'เตือน: นัดหมายแพทย์พรุ่งนี้',
        color: 'text-blue-500',
        icon: Bell,
        action: 'ดูรายละเอียด',
        ...getTailwindClasses('text-blue-500')
    },
    'appointment_rescheduled': {
        title: 'นัดหมายถูกเลื่อน',
        color: 'text-orange-500',
        icon: Clock,
        action: 'ดูรายละเอียด',
        ...getTailwindClasses('text-orange-500')
    },
    'vital_signs_fill': {
        title: 'ข้อมูลสุขภาพยังไม่สมบูรณ์!',
        color: 'text-teal-600',
        icon: HeartPulse,
        action: 'กรอกข้อมูล',
        ...getTailwindClasses('text-teal-600')
    },
    'prescription_status': {
        title: 'แจ้งเตือนสถานะยา',
        color: 'text-green-600',
        icon: Pill,
        action: 'ติดตามสถานะ',
        ...getTailwindClasses('text-green-600')
    },
    'follow_up_fill': {
        title: 'เตือน: บันทึกข้อมูลสุขภาพประจำวัน',
        color: 'text-purple-600',
        action: 'กรอกข้อมูล',
        icon: CalendarCheck,
        ...getTailwindClasses('text-purple-600')
    },
};