import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopHome from '../components/desktop/DesktopHome';
import MobileHome from '../components/mobile/MobileHome';

export default function HomePage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopHome />}
      mobile={<MobileHome />}
    />
  );
}
