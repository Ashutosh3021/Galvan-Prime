import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopStatus from '../components/desktop/DesktopStatus';
import MobileStatus from '../components/mobile/MobileStatus';

export default function StatusPage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopStatus />}
      mobile={<MobileStatus />}
    />
  );
}
