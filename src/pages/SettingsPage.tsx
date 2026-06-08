import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopSettings from '../components/desktop/DesktopSettings';
import MobileSettings from '../components/mobile/MobileSettings';

export default function SettingsPage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopSettings />}
      mobile={<MobileSettings />}
    />
  );
}
