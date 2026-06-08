import ResponsiveWrapper from '../components/shared/ResponsiveWrapper';
import DesktopApiDocs from '../components/desktop/DesktopApiDocs';
import MobileApiDocs from '../components/mobile/MobileApiDocs';

export default function ApiDocsPage() {
  return (
    <ResponsiveWrapper
      desktop={<DesktopApiDocs />}
      mobile={<MobileApiDocs />}
    />
  );
}
