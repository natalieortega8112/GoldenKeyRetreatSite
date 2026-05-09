"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
  properties: { id: string; name: string }[];
  selectedId: string;
};

export function PropertySelector({ properties, selectedId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params.toString());
    next.set("property", e.target.value);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-muted">
        Property
      </label>
      <select
        defaultValue={selectedId}
        onChange={onChange}
        className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
      >
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
