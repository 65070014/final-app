"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-10 p-5">
        <div className="flex gap-10 mt-8">
          
          <Button onClick={() => router.push('/register')}> 
            <span role="img" aria-label="patient" className="text-4xl mb-2"></span>
            ผู้ป่วย
          </Button>

          <Button onClick={() => router.push('/doctor')}>
            <span role="img" aria-label="doctor" className="text-4xl mb-2"></span>
            แพทย์
          </Button>

          <Button onClick={() => router.push('/nurse')}>
            <span role="img" aria-label="doctor" className="text-4xl mb-2"></span>
            พยาบาล
          </Button>

        </div>
      </div>
    </main>
  );
}