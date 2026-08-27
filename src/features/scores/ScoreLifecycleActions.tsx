"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { transitionScoreAction } from "./score.actions";
import type {
  ScoreFormState,
  ScoreLifecycleAction,
  ScoreResponse,
  ScoreStatus,
} from "./scores.types";

type ActionTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

interface LifecycleActionDefinition {
  transition: ScoreLifecycleAction;
  label: string;
  tone: ActionTone;
  reasonRequired?: boolean;
  reasonPlaceholder?: string;
  confirmMessage?: string;
}

interface ScoreLifecycleActionsProps {
  competitionId: number;
  score: ScoreResponse;
}

const initialState: ScoreFormState = {
  error: null,
};

const buttonBase =
  "w-full rounded-lg px-3 py-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-50";

const toneClasses: Record<ActionTone, string> = {
  primary: "bg-sky-500 text-black hover:bg-sky-400",
  success: "bg-emerald-500 text-black hover:bg-emerald-400",
  warning: "bg-amber-400 text-black hover:bg-amber-300",
  danger:
    "border border-red-500/60 text-red-200 hover:bg-red-500/10",
  neutral:
    "border border-slate-600 text-slate-200 hover:bg-slate-800",
};

export function ScoreLifecycleActions({
  competitionId,
  score,
}: ScoreLifecycleActionsProps) {
  const actions = actionsForStatus(score.status);

  return (
    <div className="space-y-2">
      {actions.map((definition) => (
        <LifecycleActionForm
          key={definition.transition}
          competitionId={competitionId}
          score={score}
          definition={definition}
        />
      ))}
    </div>
  );
}

function LifecycleActionForm({
  competitionId,
  score,
  definition,
}: {
  competitionId: number;
  score: ScoreResponse;
  definition: LifecycleActionDefinition;
}) {
  const [state, action] = useActionState(
    transitionScoreAction.bind(
      null,
      competitionId,
      score.eventId,
      score.id,
      definition.transition
    ),
    initialState
  );

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    if (
      definition.confirmMessage &&
      !window.confirm(definition.confirmMessage)
    ) {
      event.preventDefault();
    }
  };

  if (definition.reasonRequired) {
    return (
      <details>
        <summary
          className={`cursor-pointer list-none text-center ${buttonBase} ${
            toneClasses[definition.tone]
          }`}
        >
          {definition.label}
        </summary>

        <form
          action={action}
          onSubmit={handleSubmit}
          className="mt-2 space-y-2 rounded-lg border border-slate-700 bg-slate-950 p-2"
        >
          <textarea
            name="reason"
            required
            maxLength={500}
            rows={3}
            placeholder={
              definition.reasonPlaceholder ??
              "Reason for this action"
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white outline-none ring-orange-500 focus:ring-2"
          />

          <SubmitButton
            label={`Confirm ${definition.label.toLowerCase()}`}
            tone={definition.tone}
          />

          <Feedback state={state} />
        </form>
      </details>
    );
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <SubmitButton
        label={definition.label}
        tone={definition.tone}
      />

      <Feedback state={state} />
    </form>
  );
}

function SubmitButton({
  label,
  tone,
}: {
  label: string;
  tone: ActionTone;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className={`${buttonBase} ${toneClasses[tone]}`}
    >
      {pending ? "Working..." : label}
    </button>
  );
}

function Feedback({
  state,
}: {
  state: ScoreFormState;
}) {
  if (state.error) {
    return (
      <p role="alert" className="mt-1 text-xs text-red-300">
        {state.error}
      </p>
    );
  }

  if (state.success) {
    return (
      <p role="status" className="mt-1 text-xs text-emerald-300">
        {state.success}
      </p>
    );
  }

  return null;
}

function actionsForStatus(
  status: ScoreStatus
): LifecycleActionDefinition[] {
  switch (status) {
    case "DRAFT":
    case "SUBMITTED":
      return [
        {
          transition: "VALIDATE",
          label: "Validate",
          tone: "primary",
        },
        {
          transition: "REJECT",
          label: "Reject",
          tone: "danger",
          reasonRequired: true,
          reasonPlaceholder: "Why is this score being rejected?",
        },
      ];

    case "VALIDATED":
      return [
        {
          transition: "PUBLISH",
          label: "Publish",
          tone: "success",
          confirmMessage:
            "Publish this score to the public leaderboard?",
        },
        {
          transition: "REJECT",
          label: "Reject",
          tone: "danger",
          reasonRequired: true,
          reasonPlaceholder: "Why is this score being rejected?",
        },
      ];

    case "REJECTED":
      return [
        {
          transition: "VALIDATE",
          label: "Validate",
          tone: "primary",
        },
      ];

    case "PUBLISHED":
      return [
        {
          transition: "LOCK",
          label: "Lock",
          tone: "warning",
          confirmMessage:
            "Lock this score against further changes?",
        },
        {
          transition: "REOPEN",
          label: "Reopen",
          tone: "danger",
          reasonRequired: true,
          reasonPlaceholder: "Why is this score being reopened?",
          confirmMessage:
            "Reopen this score as a draft? It will be removed from the public leaderboard.",
        },
      ];

    case "LOCKED":
  return [
    {
      transition: "UNLOCK",
      label: "Unlock",
      tone: "neutral",
      reasonRequired: true,
      reasonPlaceholder: "Why is this score being unlocked?",
    },
  ];
  }
}