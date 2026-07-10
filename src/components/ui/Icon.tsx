/**
 * Icon — central icon component backed by lucide-react.
 *
 * Accepts the Material Symbols icon names used throughout the codebase
 * and maps them to the correct Lucide icon. This keeps all icon
 * references in one place and eliminates the Google Fonts CDN dependency.
 *
 * Usage:
 *   <Icon name="check_circle" size={18} className="text-primary-container" />
 *   <Icon name="sync" size={18} className="animate-spin" />
 */
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Bot,
  BrainCircuit,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Cloud,
  CloudUpload,
  Database,
  Download,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  FolderOpen,
  FolderX,
  History,
  Home,
  Info,
  Layers,
  LayoutDashboard,
  LibraryBig,
  Link,
  Loader2,
  LogIn,
  MessageCircle,
  MessageSquare,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Power,
  RefreshCw,
  Save,
  Search,
  SearchCheck,
  Send,
  Settings,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Trash2,
  TrendingUp,
  Upload,
  User,
  X,
  Radio,
  BadgeCheck,
  Target,
  Cpu,
  Grid3x3,
  FilePlus,
  type LucideProps,
} from 'lucide-react';
import type { CSSProperties, FC } from 'react';

// ── Icon name → Lucide component map ─────────────────────────────────────────
const ICON_MAP: Record<string, FC<LucideProps>> = {
  // Navigation
  home: Home,
  upload_file: Upload,
  search_check: SearchCheck,
  assessment: LayoutDashboard,
  folder_open: FolderOpen,
  settings: Settings,
  arrow_forward: ArrowRight,

  // Actions
  add: Plus,
  close: X,
  delete: Trash2,
  delete_sweep: Trash2,
  download: Download,
  save: Save,
  edit: Pencil,
  content_copy: FileDown,
  check: Check,
  send: Send,
  play_arrow: Play,
  refresh: RefreshCw,
  logout: LogIn,

  // Status / feedback
  check_circle: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  radio_button_checked: CircleDot,
  radio_button_unchecked: Radio,

  // Files / docs
  picture_as_pdf: FileText,
  description: FileText,
  link: Link,
  library_books: LibraryBig,
  inbox: FolderOpen,
  folder: FolderOpen,
  folder_off: FolderX,
  file_download: Download,

  // UI / layout
  expand_more: ChevronDown,
  chevron_right: ChevronRight,
  more_vert: MoreVertical,
  more_horiz: MoreHorizontal,
  tune: SlidersHorizontal,
  search: Search,

  // AI / tech
  psychology: BrainCircuit,
  smart_toy: Bot,
  terminal: Terminal,
  database: Database,
  cloud: Cloud,
  cloud_upload: CloudUpload,
  auto_awesome: Sparkles,
  grid_on: Grid3x3,
  memory: Cpu,
  power: Power,

  // Chat
  chat_bubble: MessageCircle,
  history: History,
  bookmark: Bookmark,

  // Eval / metrics
  verified: BadgeCheck,
  target: Target,
  precision_manufacturing: Settings2,
  show_chart: TrendingUp,

  // Misc
  sync: Loader2,
  visibility: Eye,
  visibility_off: EyeOff,
  person: User,
  calendar_today: Calendar,
  attach_file: FilePlus,
  layers: Layers,
  folder_open_filled: FolderOpen,
  message_square: MessageSquare,
};

interface IconProps {
  /** Material Symbols icon name as a string, e.g. "check_circle" */
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  /** When true, applies fill style (Lucide uses fill="currentColor") */
  filled?: boolean;
  'aria-hidden'?: boolean;
  style?: CSSProperties;
}

export function Icon({
  name,
  size = 24,
  className = '',
  strokeWidth = 1.75,
  filled = false,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  const LucideIcon = ICON_MAP[name];

  if (!LucideIcon) {
    // Fallback: render a neutral dash so layout never breaks
    return (
      <span
        aria-hidden={ariaHidden}
        style={{ display: 'inline-block', width: size, height: size }}
        className={className}
      >
        <Minus size={size} strokeWidth={strokeWidth} />
      </span>
    );
  }

  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden={ariaHidden}
      className={`inline-block flex-shrink-0 ${filled ? '[&>path]:fill-current [&>circle]:fill-current [&>rect]:fill-current' : ''} ${className}`}
    />
  );
}
