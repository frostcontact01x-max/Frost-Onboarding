import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Sliders,
  ChevronRight
} from "lucide-react";

interface FormDataState {
  principalName: string;
  organization: string;
  email: string;
  phone: string;
  reputationGoals: string;
  outcomes: string;
  misunderstandings: string;
  active_channels: string[];
  other_channels: string;
  existingSuccess: string;
  workflow: string;
  timeCommitment: string;
  targetAudience: string;
  audienceStage: string;
  inspirations: string;
  tone: string[];
  avoidWords: string;
  formats: string[];
  approver: string;
  review_method: string;
  milestones: string;
  webhookUrl: string;
}

const initialFormData: FormDataState = {
  principalName: "",
  organization: "",
  email: "",
  phone: "",
  reputationGoals: "",
  outcomes: "",
  misunderstandings: "",
  active_channels: [],
  other_channels: "",
  existingSuccess: "",
  workflow: "",
  timeCommitment: "",
  targetAudience: "",
  audienceStage: "",
  inspirations: "",
  tone: [],
  avoidWords: "",
  formats: [],
  approver: "",
  review_method: "",
  milestones: "",
  webhookUrl: ""
};

const STEPS = [
  { id: 1, name: "Identity & Goals", sub: "Contact & Core Authority" },
  { id: 2, name: "Channels & Workflow", sub: "Active Platforms & Hours" },
  { id: 3, name: "Audience & Voice", sub: "Target Persona & Tone" },
  { id: 4, name: "Logistics & Commit", sub: "Approval & Bridge Delivery" }
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionMeta, setSubmissionMeta] = useState<{
    id: string;
    timestamp: string;
    webhookStatus?: { attempted: boolean; success?: boolean; error?: string };
  } | null>(null);

  // Extra features
  const [copiedId, setCopiedId] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, isSuccess]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      const arrayKey = name as keyof FormDataState;
      const currentArray = (formData[arrayKey] as string[]) || [];

      if (checkbox.checked) {
        setFormData((prev) => ({
          ...prev,
          [arrayKey]: [...currentArray, value]
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [arrayKey]: currentArray.filter((item) => item !== value)
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    if (stepErrors[name]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.principalName.trim()) errors.principalName = "Required";
      if (!formData.organization.trim()) errors.organization = "Required";
      if (!formData.email.trim()) errors.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) errors.phone = "Required";
      if (!formData.reputationGoals.trim()) errors.reputationGoals = "Required";
      if (!formData.outcomes.trim()) errors.outcomes = "Required";
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Strictly restrict submission execution to step 4
    if (currentStep < 4) {
      handleNext();
      return;
    }

    if (currentStep !== 4) {
      return;
    }

    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || data.details?.join(", ") || "Failed to transmit payload."
        );
      }

      setSubmissionMeta({
        id: data.submissionId,
        timestamp: data.timestamp,
        webhookStatus: data.webhookStatus
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setSubmitError(err.message || "Network error while connecting to server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySubmissionId = () => {
    if (submissionMeta?.id) {
      navigator.clipboard.writeText(submissionMeta.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans antialiased selection:bg-[#D00000] selection:text-white border-t-2 border-[#D00000]">
      {/* Background Mascot Mark */}
      <img
        src="https://www.image2url.com/r2/default/images/1783478548143-0eed73e1-e880-48bf-8445-908931cf33c0.png"
        className="mascot-bg select-none"
        alt=""
        aria-hidden="true"
      />

      {/* Header */}
      <header className="px-6 md:px-10 py-5 border-b border-zinc-800 bg-black flex items-center justify-between gap-4 relative z-20">
        <div className="flex items-center gap-3">
          <img
            src="https://www.image2url.com/r2/default/images/1783478548143-0eed73e1-e880-48bf-8445-908931cf33c0.png"
            className="w-8 h-8 object-contain filter drop-shadow-[0_0_8px_rgba(208,0,0,0.5)]"
            alt="Frost Media Logo"
          />
          <div>
            <span className="text-[#D00000] text-lg font-black tracking-tight uppercase leading-none font-sans block">
              Frost Media
            </span>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase block">
              Strategic Discovery Sequence
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-8 md:py-12 relative z-10 w-full flex-grow">
        {!isSuccess ? (
          <div className="space-y-8">
            {/* Minimal Step Indicator Pills */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {STEPS.map((step) => {
                  const isActive = step.id === currentStep;
                  const isDone = step.id < currentStep;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        if (step.id <= currentStep || validateStep(currentStep)) {
                          setCurrentStep(step.id);
                        }
                      }}
                      className={`text-left p-2.5 border transition-all ${
                        isActive
                          ? "bg-zinc-900 border-[#D00000] text-white"
                          : isDone
                          ? "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700"
                          : "bg-black border-zinc-900 text-zinc-600 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                        <span className={isActive ? "text-[#D00000] font-bold" : ""}>
                          0{step.id}
                        </span>
                        {isDone && <Check className="w-3 h-3 text-zinc-500" />}
                      </div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider truncate">
                        {step.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-900 h-[2px]">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step Header */}
            <div className="border-b border-zinc-800 pb-4">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D00000]">
                  Phase 0{currentStep} of 04
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {STEPS[currentStep - 1].sub}
                </span>
              </div>
              <h2 className="text-2xl font-serif text-white font-normal">
                {STEPS[currentStep - 1].name}
              </h2>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* ==================== STEP 1: IDENTITY & GOALS ==================== */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex justify-between">
                        <span>Principal Name *</span>
                        {stepErrors.principalName && (
                          <span className="text-[#D00000]">{stepErrors.principalName}</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="principalName"
                        value={formData.principalName}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className={stepErrors.principalName ? "border-[#D00000]!" : ""}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex justify-between">
                        <span>Organization *</span>
                        {stepErrors.organization && (
                          <span className="text-[#D00000]">{stepErrors.organization}</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="Company / Firm Name"
                        className={stepErrors.organization ? "border-[#D00000]!" : ""}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex justify-between">
                        <span>Client Email Address *</span>
                        {stepErrors.email && (
                          <span className="text-[#D00000]">{stepErrors.email}</span>
                        )}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="principal@firm.com"
                        className={stepErrors.email ? "border-[#D00000]!" : ""}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex justify-between">
                        <span>Direct Phone Number *</span>
                        {stepErrors.phone && (
                          <span className="text-[#D00000]">{stepErrors.phone}</span>
                        )}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        className={stepErrors.phone ? "border-[#D00000]!" : ""}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex justify-between">
                      <span>2–3 Year Authority Goal *</span>
                      {stepErrors.reputationGoals && (
                        <span className="text-[#D00000]">{stepErrors.reputationGoals}</span>
                      )}
                    </label>
                    <textarea
                      name="reputationGoals"
                      value={formData.reputationGoals}
                      onChange={handleInputChange}
                      placeholder="What specific authority or industry reputation do you want to command?"
                      className={`min-h-[90px] ${
                        stepErrors.reputationGoals ? "border-[#D00000]!" : ""
                      }`}
                      required
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex justify-between">
                      <span>Expected Content Outcomes *</span>
                      {stepErrors.outcomes && (
                        <span className="text-[#D00000]">{stepErrors.outcomes}</span>
                      )}
                    </label>
                    <textarea
                      name="outcomes"
                      value={formData.outcomes}
                      onChange={handleInputChange}
                      placeholder="e.g., deal flow, speaking keynotes, hiring, institutional credibility"
                      className={`min-h-[80px] ${
                        stepErrors.outcomes ? "border-[#D00000]!" : ""
                      }`}
                      required
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Misconceptions to Correct (Optional)
                    </label>
                    <input
                      type="text"
                      name="misunderstandings"
                      value={formData.misunderstandings}
                      onChange={handleInputChange}
                      placeholder="What current industry misconceptions exist?"
                    />
                  </div>
                </div>
              )}

              {/* ==================== STEP 2: CHANNELS & WORKFLOW ==================== */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Active Channels
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {["LinkedIn", "Podcast", "YouTube", "Newsletter"].map((channel) => (
                        <label
                          key={channel}
                          className="flex items-center gap-2.5 p-3 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-300 transition-colors"
                        >
                          <input
                            type="checkbox"
                            name="active_channels"
                            value={channel}
                            checked={formData.active_channels.includes(channel)}
                            onChange={handleInputChange}
                          />
                          <span>{channel}</span>
                        </label>
                      ))}
                    </div>
                    <input
                      type="text"
                      name="other_channels"
                      value={formData.other_channels}
                      onChange={handleInputChange}
                      placeholder="Other channels..."
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Proven Formats / Wins
                    </label>
                    <textarea
                      name="existingSuccess"
                      value={formData.existingSuccess}
                      onChange={handleInputChange}
                      placeholder="What topics or content formats have consistently worked best?"
                      className="min-h-[80px]"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Current Workflow
                    </label>
                    <textarea
                      name="workflow"
                      value={formData.workflow}
                      onChange={handleInputChange}
                      placeholder="How is content created today? (Writing, dictation, live audio)"
                      className="min-h-[80px]"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Weekly Capacity
                    </label>
                    <input
                      type="text"
                      name="timeCommitment"
                      value={formData.timeCommitment}
                      onChange={handleInputChange}
                      placeholder="How many hours per week can you dedicate?"
                    />
                  </div>
                </div>
              )}

              {/* ==================== STEP 3: AUDIENCE & VOICE ==================== */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      placeholder="e.g., Founders, VCs, Enterprise MDs, Engineers"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Audience Journey Stage
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { val: "Exploring", label: "Exploring" },
                        { val: "Deciding", label: "Actively Deciding" },
                        { val: "Building", label: "Already Building" }
                      ].map((stage) => (
                        <label
                          key={stage.val}
                          className="flex items-center gap-2.5 p-3 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-300 transition-colors"
                        >
                          <input
                            type="radio"
                            name="audienceStage"
                            value={stage.val}
                            checked={formData.audienceStage === stage.val}
                            onChange={handleInputChange}
                          />
                          <span>{stage.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Desired Natural Tone
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {["Direct", "Reflective", "Dry", "Warm", "Provocative", "Analytical"].map(
                        (t) => (
                          <label
                            key={t}
                            className="flex items-center gap-2.5 p-2.5 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-300 transition-colors"
                          >
                            <input
                              type="checkbox"
                              name="tone"
                              value={t}
                              checked={formData.tone.includes(t)}
                              onChange={handleInputChange}
                            />
                            <span>{t}</span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Benchmark Influences
                    </label>
                    <input
                      type="text"
                      name="inspirations"
                      value={formData.inspirations}
                      onChange={handleInputChange}
                      placeholder="2–3 figures or brands whose content voice you respect"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D00000] block">
                      Forbidden Words / Jargon
                    </label>
                    <input
                      type="text"
                      name="avoidWords"
                      value={formData.avoidWords}
                      onChange={handleInputChange}
                      placeholder="Words or phrases to avoid entirely"
                    />
                  </div>
                </div>
              )}

              {/* ==================== STEP 4: LOGISTICS & COMMIT ==================== */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                        Approval Authority
                      </label>
                      <input
                        type="text"
                        name="approver"
                        value={formData.approver}
                        onChange={handleInputChange}
                        placeholder="Who approves final assets?"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                        Upcoming Milestones
                      </label>
                      <input
                        type="text"
                        name="milestones"
                        value={formData.milestones}
                        onChange={handleInputChange}
                        placeholder="Key launches or event dates"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                      Review Protocol
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {["Email", "WhatsApp", "Shared doc", "Weekly call"].map((method) => (
                        <label
                          key={method}
                          className="flex items-center gap-2.5 p-2.5 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-300 transition-colors"
                        >
                          <input
                            type="radio"
                            name="review_method"
                            value={method}
                            checked={formData.review_method === method}
                            onChange={handleInputChange}
                          />
                          <span>{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Webhook Configuration toggle */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWebhookConfig(!showWebhookConfig)}
                      className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-1.5"
                    >
                      <Sliders className="w-3 h-3 text-[#D00000]" />
                      <span>{showWebhookConfig ? "Hide Webhook URL" : "Custom Webhook Endpoint"}</span>
                    </button>
                    {showWebhookConfig && (
                      <div className="mt-2 p-3 border border-zinc-800 bg-zinc-950 space-y-1">
                        <input
                          type="url"
                          name="webhookUrl"
                          value={formData.webhookUrl}
                          onChange={handleInputChange}
                          placeholder="https://your-webhook-endpoint.com/receive"
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Concise Summary Payload Audit */}
                  <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2 font-mono text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D00000] block mb-2">
                      Payload Audit Summary
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block">Principal:</span>
                        {formData.principalName || "—"} ({formData.organization || "—"})
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Contact:</span>
                        {formData.email || "—"} &bull; {formData.phone || "—"}
                      </div>
                      <div className="col-span-2">
                        <span className="text-zinc-500 block">Authority Goal:</span>
                        <p className="text-zinc-400 font-sans truncate">{formData.reputationGoals || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {submitError && (
                <div className="p-3 border border-[#D00000] bg-red-950/30 text-white flex items-center gap-3 font-mono text-xs">
                  <AlertTriangle className="w-4 h-4 text-[#D00000] shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-white text-black hover:bg-[#D00000] hover:text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Next Phase</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-[#D00000] hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(208,0,0,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Payload...</span>
                      </>
                    ) : (
                      <>
                        <span>Commit to Bridge</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* ==================== SUCCESS STATE ==================== */
          <div className="py-12 text-center space-y-6 max-w-md mx-auto animate-in fade-in duration-300">
            <img
              src="https://www.image2url.com/r2/default/images/1780480299806-55160160-e0cf-4054-812a-ae367d7100a8.png"
              className="w-24 h-24 mx-auto drop-shadow-[0_0_20px_rgba(208,0,0,0.5)] object-contain"
              alt="Success Logo"
            />

            <div className="space-y-2">
              <h2 className="text-3xl font-serif text-white font-normal">
                Strategy Synchronized.
              </h2>
              <p className="text-zinc-400 text-sm font-sans leading-relaxed">
                Your discovery payload has been indexed. Our strategy group will analyze your input and contact you within 48 hours.
              </p>
            </div>

            {submissionMeta && (
              <div className="p-3 bg-zinc-950 border border-zinc-800 font-mono text-xs space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#D00000] font-bold block">
                  Transaction Reference
                </span>
                <div className="flex items-center justify-center gap-2 text-zinc-200">
                  <span>{submissionMeta.id}</span>
                  <button
                    onClick={copySubmissionId}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setFormData(initialFormData);
                setIsSuccess(false);
                setCurrentStep(1);
                setSubmissionMeta(null);
              }}
              className="text-xs font-mono uppercase tracking-widest px-6 py-2.5 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 transition-all"
            >
              Start New Discovery
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-800 text-center text-[9px] font-mono uppercase tracking-widest text-zinc-500 relative z-10">
        &copy; {new Date().getFullYear()} Frost Media Group &bull; Confidential Uplink
      </footer>
    </div>
  );
}
