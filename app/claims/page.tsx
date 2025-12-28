"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Claim } from "@prisma/client";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      const response = await fetch("/api/claims");
      const data = await response.json();
      setClaims(data);
    };

    fetchClaims();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Claims</h1>
        <Link href="/claims/new" className="bg-blue-500 text-white py-2 px-4 rounded-md">
          New Claim
        </Link>
      </div>
      <div className="space-y-4">
        {claims.map((claim) => (
          <div key={claim.id} className="p-4 border rounded-md">
            <Link href={`/claims/${claim.id}`}>
              <h2 className="text-lg font-semibold">{claim.clientName}</h2>
              <p>Vehicle Reg: {claim.vehicleReg}</p>
              <p>Status: {claim.status}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
