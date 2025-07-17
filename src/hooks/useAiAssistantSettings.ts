import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type SettingKey = "daily_minutes_limit" | "minutes_price" | "daily_messages_limit";

interface AssistantSetting {
  setting_key: string;
  setting_value: string;
}

interface AssistantSettingsState {
  daily_minutes_limit?: string;
  minutes_price?: string;
  daily_messages_limit?: string;
}

export function useAiAssistantSettings() {
  const [values, setValues] = useState<AssistantSettingsState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // For simple form handling.
  const form = {
    values,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
      setSuccess(false);
      setError(null);
    },
    handleSubmit: async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);
      setSuccess(false);
      try {
        // Upsert each value
        for (const key of Object.keys(values) as SettingKey[]) {
          const setting_value = values[key];
          if (setting_value == null || setting_value === "") continue;
          await supabase.from("ai_assistant_settings").upsert(
            {
              setting_key: key,
              setting_value: setting_value,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "setting_key" }
          );
        }
        setSuccess(true);
      } catch (err: any) {
        setError("Failed to save settings.");
      } finally {
        setSaving(false);
      }
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ai_assistant_settings")
          .select("setting_key, setting_value")
          .in("setting_key", ["daily_minutes_limit", "minutes_price", "daily_messages_limit"]);
        if (error) {
          setError("Could not load settings.");
        } else if (data) {
          const obj: AssistantSettingsState = {};
          data.forEach((row: AssistantSetting) => {
            obj[row.setting_key as SettingKey] = row.setting_value;
          });
          setValues(obj);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    values,
    updateValue: (key: SettingKey, value: string) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    loading,
    saving,
    error,
    success,
    form,
  };
}

// Hook to get daily messages limit specifically
export function useDailyMessagesLimit() {
  const [limit, setLimit] = useState<number>(10); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_assistant_settings")
          .select("setting_value")
          .eq("setting_key", "daily_messages_limit")
          .single();
        
        if (error) {
          console.warn("Could not load daily messages limit, using default:", error);
          setLimit(10);
        } else if (data?.setting_value) {
          const parsedLimit = parseInt(data.setting_value, 10);
          setLimit(isNaN(parsedLimit) ? 10 : parsedLimit);
        } else {
          setLimit(10); // Default fallback
        }
      } catch (err) {
        console.warn("Error fetching daily messages limit, using default:", err);
        setLimit(10);
      } finally {
        setLoading(false);
      }
    };

    fetchLimit();
  }, []);

  return { limit, loading };
}
