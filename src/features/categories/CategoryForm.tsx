import {
  CategoryResponse,
  GenderClassification,
} from "./categories.types";

interface CategoryFormProps {
  category?: CategoryResponse;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

const genderClassifications: GenderClassification[] = [
  "MALE",
  "FEMALE",
  "MIXED",
  "OPEN",
  "OTHER",
];

export function CategoryForm({
  category,
  action,
  submitLabel,
}: CategoryFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-slate-200">Name</label>
          <input
            name="name"
            defaultValue={category?.name ?? ""}
            maxLength={120}
            required
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
            placeholder="RX"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">
            Gender classification
          </label>
          <select
            name="genderClassification"
            defaultValue={category?.genderClassification ?? "OPEN"}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          >
            {genderClassifications.map((classification) => (
              <option key={classification} value={classification}>
                {classification}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-slate-200">
            Division label
          </label>
          <input
            name="divisionLabel"
            defaultValue={category?.divisionLabel ?? ""}
            maxLength={80}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
            placeholder="Individual RX"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">
            Display order
          </label>
          <input
            name="displayOrder"
            type="number"
            defaultValue={category?.displayOrder ?? 0}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-200">Description</label>
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={4}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          placeholder="Describe who should compete in this category."
        />
      </div>

      <label className="flex items-center gap-3 text-sm font-bold text-slate-200">
        <input
          name="active"
          type="checkbox"
          defaultChecked={category?.active ?? true}
          className="h-4 w-4 accent-orange-500"
        />
        Active and visible on the public competition page
      </label>

      <button
        type="submit"
        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400"
      >
        {submitLabel}
      </button>
    </form>
  );
}
