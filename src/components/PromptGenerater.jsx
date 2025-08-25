import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";

/* -------------------- CONFIG -------------------- */
/* Toggle to show/hide the API+Model bar in the UI without deleting it from the code */
const SHOW_API_BAR = false;

/* -------------------- DATA -------------------- */
const DEFAULTS = {
  roles: [
    "A/B Testing Analyst","API Designer","BI Dashboard Designer","Budget Planner","Business Strategist",
    "Citation Formatter","Code Reviewer","Competitive Intelligence Analyst","Content Strategist",
    "Customer Success Manager","Customer Support Agent","Data Analyst","Data Storyteller","DevOps/SRE Advisor",
    "Editor/Proofreader","Email Marketing Specialist","Equity Research Analyst","Expert Copywriter","Fact-Checker",
    "Financial Advisor","Financial Analyst","Frontend Engineer","Growth Marketer","Interview Coach","Language Coach",
    "Legal Drafting Assistant","Legal Drafting Assistant (non-lawyer)","Literature Review Assistant","Management Consultant",
    "Market Analyst","Objection Handling Coach","OKR Coach","Onboarding Experience Designer","Product Manager",
    "Product Requirements Author","Research Methodologist","Risk Analyst","Sales Enablement Coach","SDR Script Coach",
    "Scriptwriter","SEO Specialist","Social Media Manager","Socratic Coach","Software Architect","Survey Designer",
    "Study Plan Designer","Teacher/Tutor","Technical Writer","UX Microcopy Writer","UX Researcher","UX Writer"
  ],
  objectives: [
    "Adapt content for a new audience","Ask me clarifying questions when needed","Brainstorm options",
    "Compare alternatives in a table","Convert bullets to narrative","Craft a stakeholder update",
    "Create a checklist with acceptance criteria","Create a study plan with spaced repetition",
    "Create an incident response checklist","Create an outline with sections","Create examples and variants",
    "Create objection-handling scripts","Create user stories and acceptance criteria","Define metrics and event schema",
    "Define problem, users, and JTBD","Define success metrics and guardrails","Deliver a step-by-step plan",
    "Design an experiment or A/B test plan","Document a runbook/SOP","Draft a clear first version","Draft a content calendar",
    "Draft a formal document","Draft a PRD/spec","Draft a proposal with options","Draft a risk register","Draft email sequences",
    "Draft OKRs or KPIs","Expand into long-form with headings","Explain like I’m five (ELI5)","Extract insights and implications",
    "Forecast scenarios with assumptions","Frame trade-offs and a recommendation","Generate API contract/spec",
    "Generate creative variants","Generate FAQs with concise answers","Generate ideas then critique them",
    "Generate SEO keywords and brief","Identify risks, assumptions, and gaps","Interpret a chart or dataset",
    "List pros/cons for each idea","Make a landing page outline","Map competitive landscape",
    "Map milestones, owners, and timelines","Outline data privacy considerations","Outline system/architecture choices",
    "Perform SWOT analysis","Prepare talking points and slide outline","Prioritize features (RICE/MoSCoW)",
    "Produce a compliance checklist","Produce an executive summary","Produce style guide / voice and tone",
    "Proofread and fix tone/grammar","Propose dashboards and alerts","Provide example code with comments",
    "Quiz me with answers and hints","Review code and suggest improvements","Rewrite for clarity and brevity",
    "Suggest unconventional approaches","Summarize clearly with bullet points","Summarize key findings",
    "Synthesize multiple viewpoints","Teach with examples and analogies","Turn messy notes into a clean brief",
    "Turn messy notes into a clean draft","Write a step-by-step plan",
    "Write ad copy variations","Write meeting agenda and notes template","Write unit tests and edge cases",
    "Write UX microcopy and guidelines"
  ],
  constraints: [
    "5 bullets max per list, 1–2 lines each","Ask up to 3 clarifying questions, then proceed",
    "Avoid speculation about individuals or private companies","Be concise (max 300 words unless asked otherwise)",
    "Call out constraints that limit the answer","Cite assumptions explicitly","Do not include personal data or identifiers",
    "Do not invent sources, quotes, or statistics","Don’t apologize unless there","Don’t repeat the prompt back to me",
    "Explain why each step is necessary","Follow the exact schema keys and order","Follow the provided style guide",
    "If unsure, say “I don’t know” and request data","Include risks and mitigations","Keep a neutral, professional tone",
    "List 3–5 trade-offs, then a recommendation","Max 300 words (unless asked)","No backticks or code fences in the final output",
    "No emojis or exclamation marks","No hallucinations, say “I don't know” if unsure",
    "No medical/legal/financial advice beyond general info","No placeholders like \"TBD/XX/???\"",
    "One idea per sentence; ≤20 words","Prefer active voice","Provide citations with working URLs only",
    "Redact sensitive info with [REDACTED]","Refuse unsafe or disallowed requests; explain why",
    "Respect privacy, avoid sensitive info","Return valid JSON only (no markdown)","Short intro (≤2 lines), then bullets",
    "Show brief reasoning before the answer (≤3 bullets)","State assumptions explicitly","Two levels of headings only",
    "Use current facts only, include date if relevant","Use data or references when available","Use Indian English spellings",
    "Use ISO-8601 dates (YYYY-MM-DD)","Use plain English, avoid jargon","Use simple, non-technical language"
  ],
  outputs: [
    "30-60-90 day plan","Acceptance criteria (Gherkin)","Ad copy variants (A/B/C)","API spec (OpenAPI skeleton)",
    "Blog outline with H2/H3","Budget breakdown (table)","Changelog / release notes","Checklist with acceptance criteria",
    "Checklist with numbered steps","Code snippet with comments","Comparison table","Content calendar (table)",
    "Contract clause set","CSV dataset (headers + rows)","ELI5 explanation","Email draft (subject + body)",
    "Email draft ready to send","Error-handling guidelines","Executive summary (≤200 words)","Experiment/A-B test plan",
    "FAQ (Q&A pairs)","Financial model assumptions","Hypotheses and assumptions","Insight summary with implications",
    "Internal memo","Issue/impact/mitigation table","JSON object (valid, no markdown)","JSON schema of the result",
    "Key takeaways list","KPI dashboard spec","Lesson plan","Literature review summary","Long-form article outline",
    "Markdown report","Mermaid diagram (flowchart/sequence)","Metric definitions (clear formulas)",
    "One-page brief with bullets","Personas (goals, pains, quotes)","Policy/guideline document",
    "Press release (who/what/when/why/how)","Pricing options (good/better/best)","Problem statement",
    "Product Requirements Document (PRD)","Project timeline","Proposal with 3 options","Pros/cons matrix",
    "Pseudocode of the algorithm","Quiz with answers and hints","README / setup instructions",
    "Roadmap (quarters + milestones)","Risk register (table)","SEO brief (keywords, intent, titles)",
    "SOP / runbook","SQL queries (ready to run)","Social media post pack","Step-by-step plan",
    "Study guide (sections + examples)","SWOT table","TL;DR (5 bullets max)","Table with key fields",
    "UX microcopy snippets","Unit tests (list and code)","User stories (as a…, I want…, so that…)","YAML config (valid, no markdown)"
  ],
  audiences: [
    "Academics / researchers","AI/ML engineers","Blog readers (general)","Business analysts","CEOs and founders",
    "Community moderators","Compliance officers","Content creators","Customer support agents","Customer success managers",
    "Data analysts","Data engineers","Data scientists","Developers (beginner)","Developers (intermediate)","Developers (senior)",
    "DevOps / SRE professionals","E-commerce merchants","Educators / teachers","Enterprise IT decision makers",
    "Enterprise procurement","ESL learners (non-native English)","Executives (C-suite)","Existing customers (power users)",
    "Finance / accounting team","Fintech users","Gamers","General audience (non-technical)","Global English audience",
    "Government officials / policymakers","Graduate students","Healthcare professionals","High school students",
    "HR professionals / recruiters","Indian audience (localization)","Investors / venture capitalists","Job candidates",
    "Journalists / media","K-12 students (ages 6–12)","Legal counsel / lawyers","Manufacturing operations managers",
    "Marketing managers","Middle school students","New hires / onboarding","Nonprofit / NGO staff","Open-source contributors",
    "Parents","Patients and caregivers","Policy / compliance team","Product managers","Prospective customers (leads)",
    "Real estate agents","Retail customers","Sales representatives","SEO specialists","Small business owners",
    "Social media managers","Startup founders","Support engineers","Travel planners","UK audience","Undergraduate students",
    "US audience","UX designers","Webmasters / site admins","Writers / editors"
  ],
  tones: [
    "Academic","Action-oriented","Assertive","Authoritative","Balanced","Businesslike","Calm","Candid","Casual","Cheerful",
    "Concise","Confident","Conversational","Critical","Data-driven","Direct","Diplomatic","Down-to-earth","Dry","Earnest",
    "Educational","Empathetic","Encouraging","Energetic","Engaging","Enthusiastic","Explanatory","Formal","Friendly","Fun",
    "Humorous","Humble","Inclusive","Inquisitive","Instructional","Inspirational","Journalistic","Legalistic","Lighthearted",
    "Matter-of-fact","Motivational","Neutral","Nostalgic","Objective","Optimistic","Persuasive","Plainspoken","Playful",
    "Polite","Professional","Reassuring","Reflective","Respectful","Sarcastic","Serious","Sincere","Skeptical",
    "Straightforward","Supportive","Technical","Thoughtful","Transparent","Urgent","Visionary","Warm","Witty"
  ],
  models: [
    { value: "gpt-4o-mini", label: "gpt-4o-mini (fast, cheap)" },
    { value: "o4-mini", label: "o4-mini (reasoning, small)" },
    { value: "gpt-4o", label: "gpt-4o (multimodal)" },
    { value: "gpt-4.1-mini", label: "gpt-4.1-mini" }
  ]
};

const LS_STATE = "prompt_builder_state_v1";
const LS_KEY_OPTIN = "pb_api_key_optin";

/* ---------- backend helpers ---------- */
async function saveCustomToBackend(category, value) {
  try {
    await fetch("http://localhost:8000/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, value })
    });
  } catch (e) {
    console.warn("Backend unavailable; custom item kept locally only.", e);
  }
}

/* ---------- Tag picker (closes when clicking outside) ---------- */
function TagPicker({ title, hint, options, selected, setSelected, onAddCustom }) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool = options.filter((o) => !selected.includes(o));
    const starts = [];
    const contains = [];
    for (const o of pool) {
      const lo = o.toLowerCase();
      if (lo.startsWith(q)) starts.push(o);
      else if (lo.includes(q)) contains.push(o);
    }
    return [...starts, ...contains];
  }, [options, selected, query]);

  const addSuggestion = (val) => {
    if (!val) return;
    if (!selected.includes(val)) setSelected([...selected, val]);
    setQuery("");
    setActiveIdx(-1);
    setOpen(false);
  };

  const addCustomInline = () => {
    const val = query.trim();
    if (!val) return;
    if (onAddCustom) onAddCustom(val);
    setQuery("");
    setActiveIdx(-1);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        addSuggestion(suggestions[Math.max(0, activeIdx)]);
      } else {
        addCustomInline();
      }
    } else if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div ref={wrapRef} className="bg-white border border-gray-200 rounded-[5px] pt-2 px-2 shadow-sm md:col-span-6 col-span-12 relative">
      <h2 className="text-[13px] uppercase tracking-wide text-[#2b3037] mb-1">{title}</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); setOpen(true); }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(!!query)}
        onBlur={() => setTimeout(() => setOpen(false), 0)}
        placeholder={`Type to search & Enter to add ${title.toLowerCase()}…`}
        className="w-full rounded-md border border-[#dde5f3] bg-[#f7faff] text-[#2c4975] px-3 py-[5px] text-[14px]"
      />

      {open && query && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[#dde5f3] bg-white shadow">
          {suggestions.map((opt, idx) => (
            <li
              key={opt}
              onMouseDown={() => addSuggestion(opt)}
              className={`px-3 py-2 cursor-pointer ${idx === activeIdx ? "bg-[#eef3ff] text-[#2c4975]" : "hover:bg-[#f7faff]"}`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-[#6b88b9]">{hint}</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-2 mb-2">
        {selected.map((v) => (
          <span key={v} className="inline-flex items-center gap-2 rounded-full bg-[#eaf1ff] text-[#2c4975] px-4 py-2">
            {v}
            <button
              className="text-[#6b88b9] hover:text-[#2c4975]"
              onClick={() => setSelected(selected.filter((x) => x !== v))}
              aria-label={`Remove ${v}`}
              title="Remove from selection"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------- PROMPT BUILDER (the full UI) -------------------- */
function PromptBuilder({ onClose, onPromptGenerated }) {
  const [roles, setRoles] = useState(DEFAULTS.roles);
  const [objectives, setObjectives] = useState(DEFAULTS.objectives);
  const [constraints, setConstraints] = useState(DEFAULTS.constraints);
  const [outputs, setOutputs] = useState(DEFAULTS.outputs);
  const [audiences, setAudiences] = useState(DEFAULTS.audiences);
  const [tones, setTones] = useState(DEFAULTS.tones);

  const [selRole, setSelRole] = useState([]);
  const [selObjective, setSelObjective] = useState([]);
  const [selConstraint, setSelConstraint] = useState([]);
  const [selOutput, setSelOutput] = useState([]);
  const [selAudience, setSelAudience] = useState([]);
  const [selTone, setSelTone] = useState([]);

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULTS.models[0].value);

  const [topic, setTopic] = useState("");
  const [audienceText, setAudienceText] = useState("");
  const [toneText, setToneText] = useState("");
  const [promptArea, setPromptArea] = useState("");

  /* Keep all the state & logic for the (hidden) API bar so it remains in code but not visible */
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY_OPTIN);
    if (stored) { try { setApiKey(atob(stored)); } catch {} }
  }, []);
  const handleApiKeyChange = (v) => {
    setApiKey(v);
    if (!v) localStorage.removeItem(LS_KEY_OPTIN);
    else localStorage.setItem(LS_KEY_OPTIN, btoa(v));
  };

  useEffect(() => {
    const raw = localStorage.getItem(LS_STATE);
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      if (s.model) setModel(s.model);
      if (s.picks?.role) setSelRole(s.picks.role);
      if (s.picks?.objective) setSelObjective(s.picks.objective);
      if (s.picks?.constraint) setSelConstraint(s.picks.constraint);
      if (s.picks?.output) setSelOutput(s.picks.output);
      if (s.picks?.audience) setSelAudience(s.picks.audience || []);
      if (s.picks?.tone) setSelTone(s.picks.tone || []);
      if (s.topic) setTopic(s.topic);
      if (s.audience) setAudienceText(s.audience);
      if (s.tone) setToneText(s.tone);
      if (s.prompt) setPromptArea(s.prompt);
    } catch (e) { console.warn("State load error", e); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8000/custom");
        const { custom } = await res.json();
        if (custom?.roles?.length) setRoles(prev => [...new Set([...prev, ...custom.roles])]);
        if (custom?.objectives?.length) setObjectives(prev => [...new Set([...prev, ...custom.objectives])]);
        if (custom?.audiences?.length) setAudiences(prev => [...new Set([...prev, ...custom.audiences])]);
        if (custom?.constraints?.length) setConstraints(prev => [...new Set([...prev, ...custom.constraints])]);
        if (custom?.tones?.length) setTones(prev => [...new Set([...prev, ...custom.tones])]);
        if (custom?.outputs?.length) setOutputs(prev => [...new Set([...prev, ...custom.outputs])]);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const st = {
      apiKey: apiKey ? "SET" : "",
      model,
      picks: { role: selRole, objective: selObjective, constraint: selConstraint, output: selOutput, audience: selAudience, tone: selTone },
      topic, audience: audienceText, tone: toneText, prompt: promptArea
    };
    localStorage.setItem(LS_STATE, JSON.stringify(st));
  }, [apiKey, model, selRole, selObjective, selConstraint, selOutput, selAudience, selTone, topic, audienceText, toneText, promptArea]);

  const addCustom = (type, value) => {
    const val = (value || "").trim();
    if (!val) return;

    const catMap = { role: "role", objective: "objective", constraint: "constraint", output: "output", audience: "audience", tone: "tone" };
    if (catMap[type]) saveCustomToBackend(catMap[type], val);

    if (type === "role") { if (!roles.includes(val)) setRoles([...roles, val]); setSelRole([...new Set([...selRole, val])]); }
    if (type === "objective") { if (!objectives.includes(val)) setObjectives([...objectives, val]); setSelObjective([...new Set([...selObjective, val])]); }
    if (type === "constraint") { if (!constraints.includes(val)) setConstraints([...constraints, val]); setSelConstraint([...new Set([...selConstraint, val])]); }
    if (type === "output") { if (!outputs.includes(val)) setOutputs([...outputs, val]); setSelOutput([...new Set([...selOutput, val])]); }
    if (type === "audience") { if (!audiences.includes(val)) setAudiences([...audiences, val]); setSelAudience([...new Set([...selAudience, val])]); }
    if (type === "tone") { if (!tones.includes(val)) setTones([...tones, val]); setSelTone([...new Set([...selTone, val])]); }
  };

  const composePrompt = useCallback(() => {
    const parts = [];
    if (selRole.length) parts.push(`Role: ${selRole.join("; ")}`);
    if (topic) parts.push(`Context: ${topic}`);
    if (selObjective.length) parts.push(`Objectives:\n- ${selObjective.join("\n- ")}`);
    if (selConstraint.length) parts.push(`Constraints:\n- ${selConstraint.join("\n- ")}`);
    if (selOutput.length) parts.push(`Desired Output:\n- ${selOutput.join("\n- ")}`);

    const audienceList = [...selAudience, ...(audienceText ? [audienceText] : [])];
    const toneList = [...selTone, ...(toneText ? [toneText] : [])];
    if (audienceList.length) parts.push(`Audience: ${audienceList.join("; ")}`);
    if (toneList.length) parts.push(`Tone: ${toneList.join("; ")}`);

    const final = `You are ${selRole[0] || "a helpful expert"}.\n\n${parts.join(
      "\n\n"
    )}\n\nInstructions:\n1) Ask 2-3 clarification questions if needed.\n2) Then produce the Desired Output.\n3) Cite any assumptions.`;
    setPromptArea(final);
    
    // If callback is provided, send the prompt and close modal
    if (onPromptGenerated) {
      onPromptGenerated(final);
      onClose();
    }
    
    return final;
  }, [selRole, topic, selObjective, selConstraint, selOutput, selAudience, selTone, audienceText, toneText, onPromptGenerated, onClose]);

  /* Kept for completeness; the related UI is hidden */
  const callOpenAI = async (systemPrompt, userPrompt) => {
    if (!apiKey) { alert("Please paste your OpenAI API key."); return ""; }
    const body = { model, messages: [ ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), { role: "user", content: userPrompt } ] };
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`OpenAI error (${res.status}): ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  };
  const onRefine = async () => {
    try {
      const text = promptArea || composePrompt();
      const instruction = "Rewrite and improve the following prompt for clarity, completeness, and non-technical users. Preserve intent. Respond with the improved prompt only.";
      const improved = await callOpenAI(instruction, text);
      if (improved) setPromptArea(improved);
    } catch (e) { alert(e.message); }
  };
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(promptArea || ""); alert("Copied ✓"); }
    catch { alert("Copy failed"); }
  };

  const onReset = () => {
    setSelRole([]); setSelObjective([]); setSelConstraint([]); setSelOutput([]);
    setSelAudience([]); setSelTone([]);
    setTopic(""); setAudienceText(""); setToneText(""); setPromptArea("");
  };

  return (
    <div className="w-full p-2 bg-white overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <h1 className="text-lg font-bold">🧩 Prompt Builder</h1>
        <div className="flex gap-2">
          <button className="bg-red-200 font-semibold text-red-600 rounded-md px-3 py-1 text-[13px] hover:bg-red-300" onClick={onReset}>Reset</button>
          <button
            aria-label="Close"
            onClick={onClose}
            className="bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-md px-3 py-1 text-[13px] font-semibold"
          >
            ×
          </button>
        </div>
      </div>

      {/* API + Model (kept in code but hidden from UI) */}
      <div
        className={`bg-white border border-[#e8ecf3] rounded-[5px] p-2 shadow-sm mb-2 ${SHOW_API_BAR ? "" : "hidden"}`}
        style={!SHOW_API_BAR ? { display: "none" } : undefined}
        aria-hidden={!SHOW_API_BAR}
      >
        <div className="grid grid-cols-12 gap-3">
          <div className="md:col-span-5 col-span-12">
            <input className="w-full bg-[#e0e4ed] text-gray-700 rounded-lg p-2" placeholder="OpenAI API Key (sk-...) — stored locally" value={apiKey} onChange={(e) => handleApiKeyChange(e.target.value)} type="password" />
          </div>
          <div className="md:col-span-4 col-span-12">
            <select className="w-full bg-[#e0e4ed] text-gray-700 rounded-lg p-2" value={model} onChange={(e) => setModel(e.target.value)}>
              {DEFAULTS.models.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </select>
          </div>
          <div className="md:col-span-3 col-span-12 flex gap-2">
            <button className="bg-blue-300 hover:bg-blue-400 text-blue-900 font-semibold rounded-lg px-3 py-2 w-full md:w-auto" onClick={onRefine}>Refine with Model</button>
            <button className="bg-blue-300 hover:bg-blue-400 text-blue-900 font-semibold rounded-lg px-3 py-2 w-full md:w-auto" onClick={onCopy}>Copy Prompt</button>
          </div>
        </div>
        <div className="text-sm text-[#6b88b9] mt-2">Tip: your API key stays in your browser (localStorage).</div>
      </div>

      {/* Pickers */}
      <div className="grid grid-cols-12 gap-2">
        <TagPicker title="ROLE" hint="Type to search & Enter to add ROLE" options={roles} selected={selRole} setSelected={setSelRole} onAddCustom={(val) => addCustom("role", val)} />
        <TagPicker title="TONE" hint="Type to search & Enter to add TONE" options={tones} selected={selTone} setSelected={setSelTone} onAddCustom={(val) => addCustom("tone", val)} />
        <TagPicker title="OBJECTIVE" hint="Type to search & Enter to add CONTENT" options={objectives} selected={selObjective} setSelected={setSelObjective} onAddCustom={(val) => addCustom("objective", val)} />
        <TagPicker title="AUDIENCE" hint="Type to search & Enter to add AUDIENCE" options={audiences} selected={selAudience} setSelected={setSelAudience} onAddCustom={(val) => addCustom("audience", val)} />
        <TagPicker title="CONSTRAINTS" hint="Type to search & Enter to add CONSTRAINT" options={constraints} selected={selConstraint} setSelected={setSelConstraint} onAddCustom={(val) => addCustom("constraint", val)} />
        <TagPicker title="OUTPUT" hint="Type to search & Enter to add OUTPUT" options={outputs} selected={selOutput} setSelected={setSelOutput} onAddCustom={(val) => addCustom("output", val)} />
      </div>

      {/* Generated Prompt */}
      <div className="bg-white border border-gray-300 rounded-[5px] p-2 shadow-sm mt-2">
      <button className="bg-blue-300 hover:bg-blue-400 text-blue-900 font-semibold rounded-md px-2 py-1 text-sm" onClick={composePrompt}>Compose Prompt</button>
      </div>

      <div className="text-slate-500 text-sm mt-2">Use "Compose Prompt" to build your final prompt quickly.</div>
    </div>
  );
}

/* -------------------- MODAL WRAPPER (fixed 90vh, mobile-first) -------------------- */
function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Centered panel — phone: 100vw; tablet/desktop: min(90vw, 800px); height fixed at 90vh */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-[100vw] max-w-[100vw] sm:w-[min(90vw,800px)] h-[90vh] bg-white rounded-xl shadow-2xl border border-[#e8ecf3] overflow-hidden overflow-x-hidden flex flex-col touch-pan-y"
      >
        {/* Top bar - removed heading */}
        <div className="border-b bg-gray-50 h-1">
        </div>

        {/* Content area (vertical scrolling only) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

/* Ensure viewport meta + horizontal overflow guard (no extra libs) */
function useMobileViewportGuard() {
  useEffect(() => {
    let tag = document.querySelector('meta[name="viewport"]');
    const desired = "width=device-width, initial-scale=1, viewport-fit=cover";
    const prevContent = tag?.getAttribute("content") ?? null;
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "viewport");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", desired);

    const style = document.createElement("style");
    style.setAttribute("data-mobile-guard", "true");
    style.innerHTML = "html,body{overflow-x:hidden;}";
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) style.parentNode.removeChild(style);
      if (tag && prevContent !== null) tag.setAttribute("content", prevContent);
    };
  }, []);
}

/* -------------------- APP (Modal-wrapped PromptBuilder) -------------------- */
const PromptGenerater = ({ open, onClose, onPromptGenerated }) => {
  // Inject viewport tag + CSS guard
  useMobileViewportGuard();

  return (
    <Modal open={open} onClose={onClose}>
      <PromptBuilder onClose={onClose} onPromptGenerated={onPromptGenerated} />
    </Modal>
  );
}


export default PromptGenerater
