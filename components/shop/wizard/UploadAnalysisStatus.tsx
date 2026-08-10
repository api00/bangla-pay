"use client";

export type UploadAnalysisKind =
  | "reading"
  | "success"
  | "notice"
  | "error";

export interface UploadAnalysisFeedback {
  kind: UploadAnalysisKind;
  filename: string;
  fileId: string;
  message: string;
  retryable?: boolean;
}

interface UploadAnalysisStatusProps {
  feedback: UploadAnalysisFeedback;
  onRetry: () => void;
}

const toneClasses: Record<UploadAnalysisKind, string> = {
  reading: "border-pastel-green bg-mint-surface text-warm-dark",
  success: "border-pastel-green bg-light-mint text-dark-green",
  notice: "border-warning bg-warning-surface text-warning-ink",
  error: "border-heritage-red/20 bg-danger-surface text-heritage-red-ink",
};

export default function UploadAnalysisStatus({
  feedback,
  onRetry,
}: UploadAnalysisStatusProps) {
  return (
    <div
      role={feedback.kind === "error" ? "alert" : "status"}
      aria-live={feedback.kind === "error" ? "assertive" : "polite"}
      className={`mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border px-4 py-3 text-[13px] leading-[1.55] ${toneClasses[feedback.kind]}`}
    >
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${
          feedback.kind === "reading"
            ? "animate-pulse bg-wise-green motion-reduce:animate-none"
            : feedback.kind === "error"
              ? "bg-heritage-red"
              : feedback.kind === "notice"
                ? "bg-warning-ink"
                : "bg-positive"
        }`}
      />
      <p className="min-w-0 flex-1">
        <span className="font-semibold">{feedback.filename}:</span>{" "}
        {feedback.message}
      </p>
      {feedback.retryable && feedback.kind !== "reading" && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center rounded-pill px-3 font-semibold underline decoration-current decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          Try again
        </button>
      )}
    </div>
  );
}
