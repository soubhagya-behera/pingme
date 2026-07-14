import SettingsHeader from "../../components/user/settings/SettingsHeader";

import SettingsSection from "../../components/user/settings/SettingsSection";

import PasswordCard from "../../components/user/settings/PasswordCard";

export default function Settings(){

return(

<div>

<SettingsHeader/>

<SettingsSection

title="Security"

description="Update your password regularly to keep your account secure."

>

<PasswordCard/>

</SettingsSection>

</div>

);

}