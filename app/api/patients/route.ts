import {getDbPool} from '@/lib/db'
import {NextResponse} from 'next/server'

export async function GET(){
    const dbPool = getDbPool(); 
    let db = null;

    try{
        db = await dbPool.getConnection(); 
        const sql = "SELECT * FROM Patient"
        const [tests] = await db.query(sql)
        return NextResponse.json(tests)
    }catch(error){
        console.log(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }finally {
        if (db) {
            db.release(); 
        }
    }
}