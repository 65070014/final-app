import {createConnection} from '@/lib/db'
import {NextResponse} from 'next/server'

export async function GET(){
    try{
        const db = await createConnection()
        const sql = "SELECT * FROM Medical_Personnel"
        const [rows] = await db.query(sql)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doctors = (rows as any[]).map(doc => ({
            id: doc.medical_personnel_id.toString(),
            name: `${doc.fname} ${doc.lname}`,
        }));

        return NextResponse.json(doctors);
        
    }catch(error){
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}