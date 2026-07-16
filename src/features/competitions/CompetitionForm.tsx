import {
  CompetitionResponse,
  CompetitionStatus,
  RegistrationStatus,
  VisibilityStatus,
} from "@/features/competitions/competitions.types";

interface CompetitionFormProps {
  competition?: CompetitionResponse;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

const registrationStatuses: RegistrationStatus[] = [
  "CLOSED",
  "OPEN",
  "WAITLIST",
  "FULL",
];

const visibilityStatuses: VisibilityStatus[] = ["PRIVATE", "PUBLIC"];

const competitionStatuses: CompetitionStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "LIVE",
  "FINISHED",
  "ARCHIVED",
];

export function CompetitionForm({
  competition,
  action,
  submitLabel,
}: CompetitionFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-slate-200">Name</label>
          <input
            name="name"
            defaultValue={competition?.name ?? ""}
            required
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
            placeholder="SIVARFEST 2026"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">Slug</label>
          <input
            name="slug"
            defaultValue={competition?.slug ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
            placeholder="sivarfest-2026"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-200">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          defaultValue={competition?.shortDescription ?? ""}
          rows={3}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          placeholder="Official CrossFit competition portal for SIVARFEST."
        />
      </div>

      <div>
        <label className="text-sm font-bold text-slate-200">
          Full Description
        </label>
        <textarea
          name="fullDescription"
          defaultValue={competition?.fullDescription ?? ""}
          rows={5}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-slate-200">
            Location Name
          </label>
          <input
            name="locationName"
            defaultValue={competition?.locationName ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
            placeholder="Santa Ana, El Salvador"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">Address</label>
          <input
            name="address"
            defaultValue={competition?.address ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
            placeholder="Event address"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="text-sm font-bold text-slate-200">Event Date</label>
          <input
            name="eventDate"
            type="date"
            defaultValue={competition?.eventDate ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">Start Time</label>
          <input
            name="startTime"
            type="time"
            defaultValue={competition?.startTime?.slice(0, 5) ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">End Time</label>
          <input
            name="endTime"
            type="time"
            defaultValue={competition?.endTime?.slice(0, 5) ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="text-sm font-bold text-slate-200">
            Registration
          </label>
          <select
            name="registrationStatus"
            defaultValue={competition?.registrationStatus ?? "CLOSED"}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          >
            {registrationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">Visibility</label>
          <select
            name="visibilityStatus"
            defaultValue={competition?.visibilityStatus ?? "PRIVATE"}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          >
            {visibilityStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">Status</label>
          <select
            name="status"
            defaultValue={competition?.status ?? "DRAFT"}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          >
            {competitionStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-bold text-slate-200">
            Logo Image URL
          </label>
          <input
            name="logoImageUrl"
            defaultValue={competition?.logoImageUrl ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-200">
            Banner Image URL
          </label>
          <input
            name="bannerImageUrl"
            defaultValue={competition?.bannerImageUrl ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-200">
          Check-in opens minutes before heat
        </label>
        <input
          name="checkInOpenMinutesBeforeHeat"
          type="number"
          min={0}
          defaultValue={competition?.checkInOpenMinutesBeforeHeat ?? 10}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-orange-500 focus:ring-2"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400"
      >
        {submitLabel}
      </button>
    </form>
  );
}