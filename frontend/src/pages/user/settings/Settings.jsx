import SettingsHeader from "../../../components/user/settings/SettingsHeader";
import SettingsSection from "../../../components/user/settings/SettingsSection";
import PasswordCard from "../../../components/user/settings/PasswordCard";
import AccountCard from "../../../components/user/settings/AccountCard";
import "../../../styles/user/settings/settings.css";

export default function Settings() {
  return (
    <div className="settings-page">
      <SettingsHeader />

      <SettingsSection
        title="Account Information"
        description="Your registered account details."
      >
        <AccountCard />
      </SettingsSection>

      <SettingsSection
        title="Security"
        description="Update your password regularly to keep your account secure."
      >
        <PasswordCard />
      </SettingsSection>
    </div>
  );
}
