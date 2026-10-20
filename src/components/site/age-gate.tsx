"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "glp-research-ack-v1";

export function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- acknowledgement is stored in localStorage
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {}
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="grid-bg relative bg-ink-900 px-8 py-8 text-white">
          <div className="grid size-12 place-items-center rounded-2xl bg-mint-400/15 ring-1 ring-mint-300/30">
            <FlaskConical className="size-6 text-mint-300" />
          </div>
          <h2 id="age-gate-title" className="mt-5 text-2xl font-semibold tracking-tight">
            For laboratory research use only
          </h2>
          <p className="mt-2 text-sm text-ink-200">Please confirm the following before entering.</p>
        </div>
        <div className="space-y-4 px-8 py-6 text-sm text-slate-700">
          <ul className="space-y-3">
            {[
              "I am at least 18 years of age.",
              "I understand all products are sold strictly for in-vitro and laboratory research and are not for human or veterinary use, diagnosis or treatment.",
              "I am responsible for complying with the laws and regulations that apply where I live and work.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mint-500" />
                {line}
              </li>
            ))}
          </ul>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => (window.location.href = "https://www.google.com")}>
              Leave site
            </Button>
            <Button onClick={accept}>I confirm, enter site</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
