import React from "react";
import { useAiAssistantSettings } from "@/hooks/useAiAssistantSettings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

export const AiAssistantSettingsTab: React.FC = () => {
  const {
    values,
    updateValue,
    form,
    loading,
    saving,
    error,
    success
  } = useAiAssistantSettings();

  return (
    <Card className="max-w-xl shadow-xl bg-gradient-to-br from-background via-card/80 to-primary-900/5 backdrop-blur-lg border">
      <CardHeader>
        <CardTitle className="flex gap-3 items-center text-lg">AI Assistant Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit}
          className="space-y-7"
          autoComplete="off"
        >
          <div>
            <label htmlFor="daily_minutes_limit" className="block text-base font-medium mb-1">
              Daily Free Minutes Limit
            </label>
            <Input
              id="daily_minutes_limit"
              name="daily_minutes_limit"
              type="number"
              min={0}
              placeholder="E.g. 5"
              value={form.values.daily_minutes_limit ?? ""}
              onChange={form.handleChange}
              disabled={saving}
            />
            <div className="text-xs text-muted-foreground mt-1">
              The maximum free AI assistant minutes given to students each day.
            </div>
          </div>
          <div>
            <label htmlFor="minutes_price" className="block text-base font-medium mb-1">
              Minute Price (Credits / min)
            </label>
            <Input
              id="minutes_price"
              name="minutes_price"
              type="number"
              min={0}
              placeholder="E.g. 1"
              value={form.values.minutes_price ?? ""}
              onChange={form.handleChange}
              disabled={saving}
            />
            <div className="text-xs text-muted-foreground mt-1">
              Number of wallet credits required to purchase 1 AI minute.
            </div>
          </div>
          <div>
            <label htmlFor="daily_messages_limit" className="block text-base font-medium mb-1">
              Daily Messages Limit
            </label>
            <Input
              id="daily_messages_limit"
              name="daily_messages_limit"
              type="number"
              min={1}
              placeholder="E.g. 10"
              value={form.values.daily_messages_limit ?? ""}
              onChange={form.handleChange}
              disabled={saving}
            />
            <div className="text-xs text-muted-foreground mt-1">
              The maximum number of AI chat messages students can send per day.
            </div>
          </div>
          {error && (
            <div className="my-2 text-sm text-red-500">
              {error}
            </div>
          )}
          {success && (
            <div className="my-2 text-sm text-green-600">
              Settings saved!
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full flex gap-2 justify-center"
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
