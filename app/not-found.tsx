import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-8">
      <div className="text-center">
        <div className="text-gradient-env text-7xl font-bold">404</div>
        <p className="mt-3 text-slate-400">This page drifted out of the EcoSphere.</p>
        <Link href="/" className="btn-primary mx-auto mt-6 inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
