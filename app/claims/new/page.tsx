"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const createClaimSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  vehicleReg: z.string().min(1, "Vehicle registration is required"),
  lenderName: z.string().optional(),
});

type CreateClaimForm = z.infer<typeof createClaimSchema>;

export default function NewClaimPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClaimForm>({
    resolver: zodResolver(createClaimSchema),
  });

  const onSubmit = async (data: CreateClaimForm) => {
    const response = await fetch("/api/claims", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      router.push("/claims");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Claim</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium">
            Client Name
          </label>
          <input
            id="clientName"
            {...register("clientName")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.clientName && (
            <p className="text-red-500 text-sm">
              {errors.clientName.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="vehicleReg" className="block text-sm font-medium">
            Vehicle Registration
          </label>
          <input
            id="vehicleReg"
            {...register("vehicleReg")}
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.vehicleReg && (
            <p className="text-red-500 text-sm">
              {errors.vehicleReg.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lenderName" className="block text-sm font-medium">
            Lender Name
          </label>
          <input
            id="lenderName"
            {...register("lenderName")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 rounded-md"
        >
          {isSubmitting ? "Creating..." : "Create Claim"}
        </button>
      </form>
    </div>
  );
}
