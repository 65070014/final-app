"use client";

import { use, useEffect, useState } from "react";
import { TreatmentCard } from "@/components/doctor/treatment_history/treatment-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TreatmentHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/patients/treatment_history/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">ประวัติการรักษา</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : history.length > 0 ? (
        history.map((item) => (
          <TreatmentCard key={item.appointment_id} {...item} />
        ))
      ) : (
        <p className=" text-center py-10">
          ยังไม่มีประวัติการรักษา
        </p>
        
      )}
    </div>
  );
}
