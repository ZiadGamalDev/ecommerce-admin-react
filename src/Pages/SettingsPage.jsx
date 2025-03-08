import {Header} from "../Components/common/Header";
import ConnectedAccounts from "../Components/settings/ConnectedAccounts";
import DangerZone from "../Components/settings/DangerZone";
import Notifications from "../Components/settings/Notifications";
import Profile from "../Components/settings/profile";
import Security from "../Components/settings/Security";

const SettingsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
			<Header title='Settings' />
			<main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
				<Profile />
				<Notifications />
				<Security />
				<ConnectedAccounts />
				<DangerZone />
			</main>
		</div>
	);
};
export default SettingsPage;