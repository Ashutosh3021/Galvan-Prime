import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopProfile from '../components/desktop/DesktopProfile';
import MobileProfile from '../components/mobile/MobileProfile';

export default function ProfilePage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopProfile />}
      mobile={<MobileProfile />}
    />
  );
}
