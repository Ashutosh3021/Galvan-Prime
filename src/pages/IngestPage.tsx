import MobileIngest from '../components/mobile/MobileIngest';

/**
 * IngestPage — Document Ingestion
 *
 * The Ingest feature was only designed for mobile in the original HTML files.
 * On desktop, the full-width version of MobileIngest is rendered.
 * The component includes a desktop sidebar for md+ screens.
 */
export default function IngestPage() {
  return <MobileIngest />;
}
