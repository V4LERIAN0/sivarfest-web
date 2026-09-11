"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
export interface AthleteAccess {
  athleteId: number;
  fullName: string;
  categoryName: string;
  username: string;
  configured: boolean;
  mustChangePassword: boolean;
  enabled: boolean;
}
export function AthleteAccessPanel({
  competitionId,
  initial,
}: {
  competitionId: number;
  initial: AthleteAccess[];
}) {
  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState<number[]>([]);
  const [password, setPassword] = useState("");
  const [nameBased, setNameBased] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const unconfigured = rows.filter((r) => !r.configured);
  const entries = (ids: number[]) =>
    rows
      .filter((r) => ids.includes(r.athleteId))
      .map((r) => ({
        athleteId: r.athleteId,
        username: r.username.trim().toLowerCase(),
      }));
  async function reload() {
    const { data } = await apiClient.get<AthleteAccess[]>(
      `/admin/competitions/${competitionId}/athlete-access`,
    );
    setRows(data);
  }
  async function provision(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewed || !selected.length) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await apiClient.post<AthleteAccess[]>(
        `/admin/competitions/${competitionId}/athlete-access`,
        {
          temporaryPassword: nameBased ? null : password,
          useNameBasedPassword: nameBased,
          athletes: entries(selected),
        },
      );
      setRows(data);
      setSelected([]);
      setPassword("");
      setReviewed(false);
      setMessage(
        "Acceso activado. La contraseña se debe cambiar antes de entrar al dashboard.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? "No se pudo activar. Revisa usuarios duplicados y vuelve a intentar."
          : "Error al activar.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function reset(row: AthleteAccess) {
    if (!nameBased && password.length < 4) {
      setError(
        "Escribe primero la nueva contraseña temporal (mínimo 4 caracteres).",
      );
      return;
    }
    if (
      !window.confirm(
        `Restablecer el acceso de ${row.fullName} (${row.username}) e invalidar sus sesiones actuales?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await apiClient.post(`/admin/athletes/${row.athleteId}/reset-access`, {
        temporaryPassword: nameBased ? null : password,
        useNameBasedPassword: nameBased,
        athletes: entries([row.athleteId]),
      });
      await reload();
      setPassword("");
      setMessage(
        "Acceso restablecido. El atleta debe cambiar la contraseña temporal.",
      );
    } catch {
      setError(
        "No se pudo restablecer. Revisa el nombre de usuario e inténtalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  function exportCsv() {
    const quote = (value: string) =>
      `"${(/^[=+@-]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
    const csv = [
      "Nombre,Categoría,Usuario,Estado",
      ...rows
        .filter((r) => r.configured)
        .map((r) =>
          [
            r.fullName,
            r.categoryName,
            r.username,
            r.mustChangePassword ? "Cambio pendiente" : "Activado",
          ]
            .map(quote)
            .join(","),
        ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "sivarfest-usuarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
        Revisa los usuarios propuestos: los nombres compuestos pueden requerir
        corrección. La activación solo modifica las cuentas seleccionadas sin
        configurar; repetirla no restablece cuentas ya activadas. Una contraseña
        temporal compartida no comprueba la identidad de quien entra primero.
      </p>
      <form onSubmit={provision} className="mt-7 space-y-5">
        <label className="flex items-center gap-3 text-sm font-bold">
          <input
            type="checkbox"
            checked={nameBased}
            onChange={(e) => setNameBased(e.target.checked)}
          />
          Usar primer nombre + sf! por atleta (minúsculas, sin tildes).
        </label>
        {!nameBased && (
          <label className="block max-w-md text-sm font-bold">
            Contraseña temporal
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={4}
              maxLength={72}
              required
              className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-4 py-3"
            />
          </label>
        )}
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              setSelected(
                selected.length === unconfigured.length
                  ? []
                  : unconfigured.map((r) => r.athleteId),
              )
            }
            className="rounded border border-slate-600 px-4 py-3 text-sm"
          >
            Seleccionar pendientes ({unconfigured.length})
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded border border-slate-600 px-4 py-3 text-sm"
          >
            Descargar usuarios activados (sin contraseñas)
          </button>
        </div>
        <div className="overflow-x-auto rounded border border-slate-700">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-900">
              <tr>
                {[
                  "Activar",
                  "Atleta",
                  "Categoría",
                  "Usuario",
                  "Estado",
                  "Acciones",
                ].map((h) => (
                  <th className="p-3" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.athleteId} className="border-t border-slate-800">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Activar ${row.fullName}`}
                      disabled={row.configured || busy}
                      checked={selected.includes(row.athleteId)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, row.athleteId]
                            : selected.filter((id) => id !== row.athleteId),
                        )
                      }
                    />
                  </td>
                  <td className="p-3 font-bold">{row.fullName}</td>
                  <td className="p-3">{row.categoryName}</td>
                  <td className="p-3">
                    <input
                      aria-label={`Usuario de ${row.fullName}`}
                      value={row.username}
                      disabled={busy}
                      required
                      pattern="[a-z0-9]+(?:[.][a-z0-9]+)+"
                      maxLength={100}
                      onChange={(e) => {
                        setReviewed(false);
                        setRows(
                          rows.map((r) =>
                            r.athleteId === row.athleteId
                              ? { ...r, username: e.target.value }
                              : r,
                          ),
                        );
                      }}
                      className="w-full min-w-44 rounded border border-slate-700 bg-slate-950 px-3 py-2"
                    />
                  </td>
                  <td className="p-3">
                    {!row.configured
                      ? "Sin configurar"
                      : !row.enabled
                        ? "Deshabilitado"
                        : row.mustChangePassword
                          ? "Cambio pendiente"
                          : "Activado"}
                  </td>
                  <td className="p-3">
                    {row.configured && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => reset(row)}
                        className="rounded border border-orange-400/40 px-3 py-2 text-xs text-orange-200"
                      >
                        Restablecer acceso
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
            required
          />
          Revisé los usuarios y quiero activar las {selected.length} cuentas
          seleccionadas.
        </label>
        <button
          disabled={busy || !reviewed || !selected.length}
          className="rounded bg-orange-500 px-5 py-3 text-sm font-black text-black disabled:opacity-40"
        >
          {busy ? "Guardando…" : "Activar cuentas seleccionadas"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-4 text-sm text-green-300">
          {message}
        </p>
      )}
    </div>
  );
}
