import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopSignup from '../components/desktop/DesktopSignup';
import MobileSignup from '../components/mobile/MobileSignup';

export default function SignupPage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopSignup />}
      mobile={<MobileSignup />}
    />
  );
}
