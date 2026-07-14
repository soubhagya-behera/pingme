import SettingsHeader from "../../../components/user/settings/SettingsHeader";
import SettingsSection from "../../../components/user/settings/SettingsSection";
import PasswordCard from "../../../components/user/settings/PasswordCard";
import AccountCard from "../../../components/user/settings/AccountCard";

export default function Settings() {
  return (
    <div>
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