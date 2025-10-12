export async function createNotification(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db: any, 
    recipient_id: number,
    recipient_type: 'Patient' | 'Doctor' | 'Nurse',
    type: string,
    message: string,
    link: string
) {
    
    try {
        const sql = `
            INSERT INTO Notification (
                recipient_id, 
                recipient_type,
                notification_type, 
                message,
                link_url,
                create_at
            ) VALUES (?, ?, ?, ?,?,NOW());
        `;
        
        await db.query(sql, [
            recipient_id, 
            recipient_type, 
            type,
            message,
            link
        ]);

        console.log(`Notification log created for User ${recipient_id}`);

    } catch (error) {
        console.error("Failed to insert notification:", error);
    }
}