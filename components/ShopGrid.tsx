import type { MatchedItem } from "@/lib/types";

export default function ShopGrid({ items }: { items: MatchedItem[] }) {
  const matched = items.filter((i) => i.product);

  if (matched.length === 0) {
    return <p className="text-sm text-stone-500">No matching products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {matched.map((item, i) => (
        <a
          key={i}
          href={item.product!.url}
          target="_blank"
          rel="noreferrer"
          className="group rounded-xl border border-stone-200 overflow-hidden hover:shadow-md hover:border-clay-300 transition bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.product!.thumbnail} alt={item.product!.name} className="w-full aspect-square object-cover" />
          <div className="p-3">
            <div className="text-xs text-stone-400">{item.name}</div>
            <div className="font-medium text-sm leading-tight text-stone-900 group-hover:text-clay-700">
              {item.product!.name}
            </div>
            <div className="text-sm text-stone-600 mt-1">
              <span className="font-semibold text-clay-700">${item.product!.price}</span> · {item.product!.retailer}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
