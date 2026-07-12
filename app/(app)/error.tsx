"use client";

import { Icon } from "@/components/ui/Icon";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="card max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-400/10">
          <Icon name="TriangleAlert" className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-400">
          This screen hit an unexpected error. Your data is safe - try again.
        </p>
        <button onClick={reset} className="btn-primary mx-auto mt-5">
          <Icon name="RotateCcw" className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  );
}
