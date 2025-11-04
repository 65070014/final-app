"use client"
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-10 p-5">
        <div className="flex gap-10 mt-8">
          <Link href="/patient/login" passHref>
            <Button>
              <span role="img" aria-label="patient" className="text-4xl mb-2"></span>
              ผู้ป่วย
            </Button>
          </Link>
          <Link href="/doctor" passHref>
            <Button>
              <span role="img" aria-label="doctor" className="text-4xl mb-2"></span>
              แพทย์
            </Button>
          </Link>
          <Link href="/nurse" passHref>
            <Button>
              <span role="img" aria-label="doctor" className="text-4xl mb-2"></span>
              พยาบาล
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}