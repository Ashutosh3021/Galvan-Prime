import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopQuery from '../components/desktop/DesktopQuery';
import MobileQuery from '../components/mobile/MobileQuery';

export default function QueryPage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopQuery />}
      mobile={<MobileQuery />}
    />
  );
}
