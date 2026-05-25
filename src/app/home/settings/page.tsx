"use client";
import { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings } from "../../../../services/settings";
import { SpinnerCircularFixed } from "spinners-react";
import GoBackButton from "@/components/GoBackButton";
import DeleteAccountModal from "@/components/DeleteAccountModal";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    likes_public: true,
    allow_dms_from: 'everyone' as 'everyone' | 'following' | 'none',
    email_notifications: true,
    push_notifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await getUserSettings();
    if (result.data) {
      setSettings({
        likes_public: result.data.likes_public,
        allow_dms_from: result.data.allow_dms_from,
        email_notifications: result.data.email_notifications,
        push_notifications: result.data.push_notifications,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateUserSettings(settings);
    setSaving(false);
    alert("Settings saved successfully!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-30">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 z-10 flex items-center gap-3">
        <GoBackButton />
        <h1 className="text-white font-bold text-xl">Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Privacy Section */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">Privacy</h2>
          
          <div className="flex justify-between items-center py-3 border-b border-border">
            <div>
              <p className="text-white font-medium">Public Likes</p>
              <p className="text-secondary-text text-sm">Allow others to see posts you've liked</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, likes_public: !settings.likes_public })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.likes_public ? 'bg-primary' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.likes_public ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="py-3 border-b border-border">
            <p className="text-white font-medium mb-2">Who can send you messages</p>
            <select
              value={settings.allow_dms_from}
              onChange={(e) => setSettings({ ...settings, allow_dms_from: e.target.value as any })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white"
            >
              <option value="everyone">Everyone</option>
              <option value="following">People you follow</option>
              <option value="none">No one</option>
            </select>
          </div>
        </div>

        {/* Notifications Section */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4">Notifications</h2>
          
          <div className="flex justify-between items-center py-3 border-b border-border">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-secondary-text text-sm">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, email_notifications: !settings.email_notifications })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.email_notifications ? 'bg-primary' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-border">
            <div>
              <p className="text-white font-medium">Push Notifications</p>
              <p className="text-secondary-text text-sm">Receive push notifications</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, push_notifications: !settings.push_notifications })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.push_notifications ? 'bg-primary' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.push_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-white font-bold text-lg mb-4">Account</h2>
          <div className="py-3 border-b border-border">
            <DeleteAccountModal />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
