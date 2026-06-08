import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopLogin from '../components/desktop/DesktopLogin';
import MobileLogin from '../components/mobile/MobileLogin';

export default function LoginPage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopLogin />}
      mobile={<MobileLogin />}
    />
  );
}
