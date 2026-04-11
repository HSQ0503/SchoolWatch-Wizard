export type DeployState =
  | "idle"
  | "creating-repo"
  | "pushing-config"
  | "creating-project"
  | "deploying"
  | "done"
  | "error";

type Props = {
  state: DeployState;
  url?: string;
  error?: string;
  isEditMode?: boolean;
};

type Step = {
  id: DeployState;
  label: string;
};

const STEPS: Step[] = [
  { id: "creating-repo", label: "Creating repository..." },
  { id: "pushing-config", label: "Configuring your school..." },
  { id: "creating-project", label: "Setting up deployment..." },
  { id: "deploying", label: "Building your site..." },
  { id: "done", label: "Your site is live!" },
];

const STATE_ORDER: DeployState[] = [
  "idle",
  "creating-repo",
  "pushing-config",
  "creating-project",
  "deploying",
  "done",
];

const EDIT_STEPS: Step[] = [
  { id: "pushing-config", label: "Updating config..." },
  { id: "deploying", label: "Building your site..." },
  { id: "done", label: "Your changes are live!" },
];

const EDIT_STATE_ORDER: DeployState[] = [
  "idle",
  "pushing-config",
  "deploying",
  "done",
];

function CheckCircle() {
  return (
    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function GrayCircle() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/20" />
  );
}

function PulsingDot() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-20" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
    </span>
  );
}

export default function DeployProgress({ state, url, error, isEditMode }: Props) {
  if (state === "idle") return null;

  const steps = isEditMode ? EDIT_STEPS : STEPS;
  const stateOrder = isEditMode ? EDIT_STATE_ORDER : STATE_ORDER;
  const currentIndex = stateOrder.indexOf(state);

  return (
    <div className="mt-6 space-y-4">
      {/* Step list */}
      {state !== "error" && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <ol className="space-y-4">
            {steps.map((step) => {
              const stepIndex = stateOrder.indexOf(step.id);
              const isDone = currentIndex > stepIndex;
              const isCurrent = currentIndex === stepIndex;

              return (
                <li key={step.id} className="flex items-center gap-3">
                  {isDone ? <CheckCircle /> : isCurrent ? <PulsingDot /> : <GrayCircle />}
                  <span
                    className={`text-sm font-medium transition-colors duration-150 ${
                      isDone ? "text-gray-300" : isCurrent ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Done */}
      {state === "done" && url && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
          <p className="text-sm font-semibold text-green-400">Your site is live!</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-sm text-green-300 underline underline-offset-2 hover:text-green-200 transition-colors duration-150 break-all"
          >
            {url}
          </a>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-sm font-semibold text-red-400">Deployment failed</p>
          {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
