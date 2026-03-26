"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Loader2, Pencil, Star } from "lucide-react";

interface VoiceProfile {
  id: string;
  name: string;
  tone: string | null;
  exampleOutput: string | null;
  avoidWords: string | null;
  isDefault: boolean;
}

export function VoiceProfilesSection() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formTone, setFormTone] = useState("");
  const [formExample, setFormExample] = useState("");
  const [formAvoid, setFormAvoid] = useState("");

  const fetchProfiles = async () => {
    const res = await fetch("/api/voice-profiles");
    if (res.ok) {
      const data = await res.json();
      setProfiles(data.profiles);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormTone("");
    setFormExample("");
    setFormAvoid("");
    setEditing(null);
    setCreating(false);
  };

  const startEdit = (profile: VoiceProfile) => {
    setEditing(profile.id);
    setCreating(false);
    setFormName(profile.name);
    setFormTone(profile.tone || "");
    setFormExample(profile.exampleOutput || "");
    setFormAvoid(profile.avoidWords || "");
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setFormName("");
    setFormTone("");
    setFormExample("");
    setFormAvoid("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (creating) {
        await fetch("/api/voice-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            tone: formTone || null,
            exampleOutput: formExample || null,
            avoidWords: formAvoid || null,
          }),
        });
      } else if (editing) {
        await fetch(`/api/voice-profiles/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            tone: formTone || null,
            exampleOutput: formExample || null,
            avoidWords: formAvoid || null,
          }),
        });
      }
      resetForm();
      await fetchProfiles();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this voice profile?")) return;
    await fetch(`/api/voice-profiles/${id}`, { method: "DELETE" });
    await fetchProfiles();
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/voice-profiles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    await fetchProfiles();
  };

  if (loading) {
    return (
      <div className="bg-surface-low rounded-xl p-8 border border-outline/10">
        <Loader2 className="animate-spin text-text-muted mx-auto" size={24} />
      </div>
    );
  }

  const isFormOpen = creating || editing;

  return (
    <div className="bg-surface-low rounded-xl p-8 border border-outline/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-xl font-bold text-text">Voice Profiles</h3>
          <p className="text-text-muted text-sm mt-1">
            Configure how generated content sounds. Your default profile is used automatically.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-surface-high rounded-lg text-primary text-sm font-bold border border-outline/20 hover:bg-surface-bright transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> New Voice
          </button>
        )}
      </div>

      {/* Profile list */}
      {profiles.length === 0 && !isFormOpen && (
        <p className="text-text-muted text-sm py-4">
          No voice profiles yet. A default will be created when you first generate content.
        </p>
      )}

      <div className="space-y-3">
        {profiles.map((profile) =>
          editing === profile.id ? null : (
            <div
              key={profile.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                profile.isDefault
                  ? "bg-surface-high border-primary/20"
                  : "bg-surface border-outline/10"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text">{profile.name}</span>
                  {profile.isDefault && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary rounded-full font-bold uppercase">
                      Default
                    </span>
                  )}
                </div>
                {profile.tone && (
                  <p className="text-xs text-text-muted mt-1 truncate">{profile.tone}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-4">
                {!profile.isDefault && (
                  <button
                    onClick={() => handleSetDefault(profile.id)}
                    className="p-2 text-text-muted hover:text-primary transition-colors"
                    title="Set as default"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  onClick={() => startEdit(profile)}
                  className="p-2 text-text-muted hover:text-text transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="p-2 text-text-muted hover:text-error transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Create / Edit form */}
      {isFormOpen && (
        <div className="mt-4 p-6 bg-surface rounded-xl border border-outline/20 space-y-4">
          <h4 className="text-sm font-bold text-text">
            {creating ? "New Voice Profile" : "Edit Voice Profile"}
          </h4>

          <div>
            <label className="text-[11px] uppercase tracking-widest text-text-muted block mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Professional & Warm"
              className="w-full bg-black border border-outline/20 rounded-lg py-2.5 px-4 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest text-text-muted block mb-1.5">
              Tone Description <span className="normal-case text-text-muted/50">(max 500 chars)</span>
            </label>
            <textarea
              value={formTone}
              onChange={(e) => setFormTone(e.target.value.slice(0, 500))}
              placeholder="e.g. Conversational, warm, uses 'you' and 'we', avoids jargon"
              rows={2}
              className="w-full bg-black border border-outline/20 rounded-lg py-2.5 px-4 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
            <span className="text-[10px] text-text-muted">{formTone.length}/500</span>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest text-text-muted block mb-1.5">
              Example Output <span className="normal-case text-text-muted/50">(paste your best post, max 2000 chars)</span>
            </label>
            <textarea
              value={formExample}
              onChange={(e) => setFormExample(e.target.value.slice(0, 2000))}
              placeholder="Paste a sample of your writing style..."
              rows={4}
              className="w-full bg-black border border-outline/20 rounded-lg py-2.5 px-4 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
            />
            <span className="text-[10px] text-text-muted">{formExample.length}/2000</span>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest text-text-muted block mb-1.5">
              Words to Avoid <span className="normal-case text-text-muted/50">(comma-separated, max 500 chars)</span>
            </label>
            <input
              type="text"
              value={formAvoid}
              onChange={(e) => setFormAvoid(e.target.value.slice(0, 500))}
              placeholder="e.g. leverage, synergy, game-changer, delve"
              className="w-full bg-black border border-outline/20 rounded-lg py-2.5 px-4 text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !formName.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-dim rounded-lg text-background text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {creating ? "Create" : "Save"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 bg-surface-high rounded-lg text-text-muted text-sm font-medium border border-outline/20 hover:text-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
