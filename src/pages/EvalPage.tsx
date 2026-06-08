import MobileEval from '../components/mobile/MobileEval';

/**
 * EvalPage — Evaluation Suite
 *
 * The Eval feature was only designed for mobile in the original HTML files.
 * On desktop, the full-width version of MobileEval is rendered (its sidebar
 * is visible on md+ screens anyway).
 */
export default function EvalPage() {
  return <MobileEval />;
}
