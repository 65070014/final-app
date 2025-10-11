import { Notification } from "@/lib/types";
import { notificationMap } from '@/utils/notificationMapping';
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NotificationProps {
    notification: Notification[];
}

export function NotificationAlert({ notification }: NotificationProps) {
    
    const topNotifications = notification.slice(0, 2);
    if (topNotifications.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
                ไม่มีการแจ้งเตือนใหม่ในขณะนี้
            </div>
        );
    }
    
    const notif0 = topNotifications[0];
    const config0 = notif0 ? notificationMap[notif0.notification_type] : null;
    const IconComponent0 = config0 ? config0.icon : null;
    
    const notif1 = topNotifications[1];
    const config1 = notif1 ? notificationMap[notif1.notification_type] : null;
    const IconComponent1 = config1 ? config1.icon : null;

    console.log(config0)

    return (
        <>
            {config0 && IconComponent0 && (
                <Alert className={`${config0.backgroundColor} flex items-start pl-6 mb-3`}>
                    <IconComponent0 className={`h-4 w-4 ${config0.iconColor}`} />
                    <AlertDescription className={`${config0.descriptionColor} text-left`}>
                        <strong>{config0.title} :</strong> {notif0.message_text}
                    </AlertDescription>
                </Alert>
            )}
            {config1 && IconComponent1 && (
                <Alert className={`${config1.backgroundColor} flex items-start pl-6`}>
                    <IconComponent1 className={`h-4 w-4 ${config1.iconColor}`} />
                    <AlertDescription className={`${config1.descriptionColor} text-left`}>
                        <strong>{config1.title} :</strong> {notif1.message_text}
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}