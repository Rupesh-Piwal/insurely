import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-4xl font-bold">
          Welcome to the Claims Management System
        </h1>
        <p className="mt-4 text-lg">
          Manage your vehicle claims efficiently and securely.
        </p>
        <Link
          href="/claims"
          className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          View Your Claims
        </Link>
        <Link
          href="/dashboard"
          className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Go to Claims Dashboard
        </Link>
      </div>
    </>
  );
}
