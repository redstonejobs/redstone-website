import type { ReactNode } from "react";

type ConfirmActionProps = {
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  message: string;
  tone?: "navy" | "danger" | "gold";
  children?: ReactNode;
};

const toneClasses = {
  navy: "border-[#071A3D] text-[#071A3D]",
  danger: "border-red-300 text-red-700",
  gold: "border-[#D4AF37] text-[#071A3D]",
};

export function ConfirmAction({
  action,
  label,
  message,
  tone = "navy",
  children,
}: ConfirmActionProps) {
  return (
    <details className="group inline-block">
      <summary className={`cursor-pointer rounded-md border bg-white px-3 py-2 text-sm font-semibold ${toneClasses[tone]}`}>
        {label}
      </summary>
      <form action={action} className="mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
        <p className="text-sm font-semibold text-[#071A3D]">{message}</p>
        {children ? <div className="mt-3">{children}</div> : null}
        <input type="hidden" name="confirm" value="yes" />
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-[#071A3D] px-3 py-2 text-sm font-semibold text-white"
        >
          Confirm {label}
        </button>
      </form>
    </details>
  );
}

