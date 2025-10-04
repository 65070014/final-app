"use client"

import { useEffect, useState } from "react"

export default function MyComponent() {
    const [fetchedData, setFetchedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetch('/api/test')
                const response = await data.json()
                setFetchedData(response);
            } catch (error) {
                console.error("Error fetching data:", error);
            }finally {
                setIsLoading(false);
            }
        }

        fetchData();

    }, [])
    if (isLoading) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    if (!fetchedData) {
        return <div>ไม่สามารถโหลดข้อมูลได้ หรือไม่มีข้อมูล</div>;
    }
    return (
        <div>
            HI! ข้อมูลที่ได้:
            <pre>{JSON.stringify(fetchedData, null, 2)}</pre>
            {/* ถ้าข้อมูลเป็น Object มี property ชื่อ name */}
            {/* <h1>ชื่อ: {fetchedData.name}</h1> */}
        </div>
    )
}