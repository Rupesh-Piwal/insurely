"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Claim, ClaimStatus, Document, Eligibility } from "@prisma/client";

export default function ClaimDetailPage() {
  const params = useParams();
  const { id } = params;
  const [claim, setClaim] = useState<Claim & { documents: Document[] } | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityHint, setEligibilityHint] = useState<{
    eligibility: Eligibility;
    reason: string;
  } | null>(null);

  const fetchClaim = async () => {
    if (id) {
      const response = await fetch(`/api/claims/${id}`);
      const data = await response.json();
      setClaim(data);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const handleStatusChange = async (status: ClaimStatus) => {
    if (id) {
      const response = await fetch(`/api/claims/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const updatedClaim = await response.json();
        setClaim(updatedClaim);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const { uploadUrl, s3Key } = await fetch("/api/documents/upload-url", {
        method: "POST",
        body: JSON.stringify({
          claimId: id,
          fileName: file.name,
          fileType: file.type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      const documentResponse = await fetch("/api/documents", {
        method: "POST",
        body: JSON.stringify({
          claimId: id,
          fileName: file.name,
          s3Key,
          mimeType: file.type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const newDocument = await documentResponse.json();

      await fetch("/api/ai/extract-document", {
        method: "POST",
        body: JSON.stringify({
          documentId: newDocument.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await fetchClaim();
      setUploading(false);
    }
  };

  const handleSummarizeClaim = async () => {
    setSummarizing(true);
    await fetch("/api/ai/summarize-claim", {
      method: "POST",
      body: JSON.stringify({ claimId: id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    await fetchClaim();
    setSummarizing(false);
  };

  const handleCheckEligibility = async () => {
    setCheckingEligibility(true);
    const response = await fetch("/api/ai/check-eligibility", {
      method: "POST",
      body: JSON.stringify({ claimId: id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setEligibilityHint(data);
    await fetchClaim();
    setCheckingEligibility(false);
  };

  if (!claim) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{claim.clientName}</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Vehicle Reg:</strong> {claim.vehicleReg}
          </p>
          <p>
            <strong>Lender Name:</strong> {claim.lenderName}
          </p>
        </div>
        <div>
          <p>
            <strong>Status:</strong> {claim.status}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span>Change Status:</span>
            <select
              value={claim.status}
              onChange={(e) => handleStatusChange(e.target.value as ClaimStatus)}
              className="px-3 py-1 border rounded-md"
            >
              {Object.values(ClaimStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">AI Summary</h2>
        {claim.aiSummary ? (
          <p>{claim.aiSummary}</p>
        ) : (
          <p>No summary available.</p>
        )}
        <button
          onClick={handleSummarizeClaim}
          disabled={summarizing}
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          {summarizing ? "Summarizing..." : "Summarize Claim"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Eligibility Hint</h2>
        {eligibilityHint ? (
          <div>
            <p>
              <strong>Eligibility:</strong> {eligibilityHint.eligibility}
            </p>
            <p>
              <strong>Reason:</strong> {eligibilityHint.reason}
            </p>
          </div>
        ) : (
          <p>No eligibility hint available.</p>
        )}
        <button
          onClick={handleCheckEligibility}
          disabled={checkingEligibility}
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          {checkingEligibility ? "Checking..." : "Check Eligibility"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Documents</h2>
        <div className="space-y-4">
          {claim.documents.map((doc) => (
            <div key={doc.id} className="p-4 border rounded-md">
              <p>{doc.fileName}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label htmlFor="file-upload" className="block text-sm font-medium">
            Upload a new document
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="mt-1"
          />
          {uploading && <p>Uploading...</p>}
        </div>
      </div>
    </div>
  );
}
