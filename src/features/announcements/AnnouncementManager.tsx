"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { Announcement } from "./announcements.types";
export function AnnouncementManager({
  competitionId,
  initial,
}: {
  competitionId: number;
  initial: Announcement[];
}) {
  const [notices, setNotices] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function refresh() {
    const { data } = await apiClient.get<Announcement[]>(
      `/admin/competitions/${competitionId}/announcements`,
    );
    setNotices(data);
  }
  async function publish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    const f = new FormData(form);
    try {
      await apiClient.post(
        `/admin/competitions/${competitionId}/announcements`,
        {
          title: f.get("title"),
          message: f.get("message"),
          audience: f.get("audience"),
          published: true,
        },
      );
      await refresh();
      form.reset();
    } catch {
      setError("No se pudo publicar el aviso.");
    } finally {
      setBusy(false);
    }
  }
  async function hide(id: number) {
    setBusy(true);
    try {
      await apiClient.delete(`/admin/announcements/${id}`);
      await refresh();
    } catch {
      setError("No se pudo ocultar el aviso.");
    } finally {
      setBusy(false);
    }
  }
  const field =
    "mt-2 w-full rounded border border-slate-700 bg-slate-950 px-3 py-3 text-base";
  return (
    <div className="mt-6 space-y-8">
      <form onSubmit={publish} className="max-w-2xl space-y-4">
        <label className="block text-sm font-bold">
          Título
          <input name="title" required maxLength={140} className={field} />
        </label>
        <label className="block text-sm font-bold">
          Mensaje
          <textarea
            name="message"
            required
            maxLength={2000}
            rows={4}
            className={field}
          />
        </label>
        <label className="block text-sm font-bold">
          Destinatarios
          <select name="audience" className={field}>
            <option value="PUBLIC">
              Público · atletas, jueces y espectadores
            </option>
            <option value="ATHLETES">Solo atletas con sesión iniciada</option>
            <option value="JUDGES">Solo jueces con sesión iniciada</option>
          </select>
        </label>
        <p className="text-xs leading-5 text-slate-400">
          Los avisos públicos aparecen en eventos y heats. Los avisos privados
          aparecen en el dashboard correspondiente. Se actualizan al recargar la
          vista; no se envían correos ni notificaciones push.
        </p>
        <button
          disabled={busy}
          className="rounded bg-orange-500 px-5 py-3 font-black text-black disabled:opacity-50"
        >
          {busy ? "Guardando…" : "Publicar aviso"}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
      <div className="space-y-3">
        {notices.map((n) => (
          <article key={n.id} className="rounded border border-slate-700 p-5">
            <p className="text-xs text-orange-300">
              {n.audience} · {n.published ? "Publicado" : "Oculto"}
            </p>
            <h2 className="mt-2 text-lg font-black">{n.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-300">
              {n.message}
            </p>
            {n.published && (
              <button
                type="button"
                disabled={busy}
                onClick={() => hide(n.id)}
                className="mt-3 rounded border border-slate-600 px-3 py-2 text-sm"
              >
                Ocultar aviso
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
