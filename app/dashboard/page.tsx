"use client";

import { useEffect, useState } from "react";
import { Claim, ClaimStatus } from "@prisma/client";

export default function DashboardPage() {
  const [totalClaims, setTotalClaims] = useState(0);
  const [claimsByStatus, setClaimsByStatus] = useState<
    Record<ClaimStatus, number>
  >({
    NEW: 0,
    REVIEW: 0,
    SUBMITTED: 0,
    APPROVED: 0,
    REJECTED: 0,
  });
  const [recentClaims, setRecentClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const response = await fetch("/api/dashboard");
      const data = await response.json();
      setTotalClaims(data.totalClaims);
      setClaimsByStatus(data.claimsByStatus);
      setRecentClaims(data.recentClaims);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-md">
          <h2 className="text-lg font-semibold">Total Claims</h2>
          <p className="text-3xl font-bold">{totalClaims}</p>
        </div>
        <div className="p-4 border rounded-md col-span-2">
          <h2 className="text-lg font-semibold">Claims by Status</h2>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {Object.entries(claimsByStatus).map(([status, count]) => (
              <div key={status}>
                <p className="font-semibold">{status}</p>
                <p>{count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Recently Updated Claims</h2>
        <div className="space-y-4 mt-2">
          {recentClaims.map((claim) => (
            <div key={claim.id} className="p-4 border rounded-md">
              <p className="font-semibold">{claim.clientName}</p>
              <p>Vehicle Reg: {claim.vehicleReg}</p>
              <p>Status: {claim.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
