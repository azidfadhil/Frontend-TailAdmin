import GridIcon from '@/icons/GridIcon.vue'
import UserCircleIcon from '@/icons/UserCircleIcon.vue'
import UserGroupIcon from '@/icons/UserGroupIcon.vue'
import SettingsIcon from '@/icons/SettingsIcon.vue'
import TableIcon from '@/icons/TableIcon.vue'
import ListIcon from '@/icons/ListIcon.vue'
import FolderIcon from '@/icons/FolderIcon.vue'
import PieChartIcon from '@/icons/PieChartIcon.vue'
import BoxCubeIcon from '@/icons/BoxCubeIcon.vue'
import DocsIcon from '@/icons/DocsIcon.vue'
import HomeIcon from '@/icons/HomeIcon.vue'
import MenuIcon from '@/icons/MenuIcon.vue'
import TaskIcon from '@/icons/TaskIcon.vue'
import PlugInIcon from '@/icons/PlugInIcon.vue'
import PageIcon from '@/icons/PageIcon.vue'
import MailIcon from '@/icons/MailIcon.vue'
import CalenderIcon from '@/icons/CalenderIcon.vue'
import ArchiveIcon from '@/icons/ArchiveIcon.vue'
import FlagIcon from '@/icons/FlagIcon.vue'
import InfoIcon from '@/icons/InfoIcon.vue'
import GridIcon2 from '@/icons/LayoutDashboardIcon.vue'

// Map string icon name (dari database) ke komponen Vue
const iconMap: Record<string, any> = {
  // General
  'grid': GridIcon,
  'dashboard': GridIcon2,
  'home': HomeIcon,
  'settings': SettingsIcon,
  'folder': FolderIcon,
  'docs': DocsIcon,
  'page': PageIcon,
  'archive': ArchiveIcon,
  'flag': FlagIcon,
  'info': InfoIcon,
  'plug': PlugInIcon,
  'menu': MenuIcon,
  'task': TaskIcon,
  'mail': MailIcon,
  'calendar': CalenderIcon,
  'chart': PieChartIcon,

  // User related
  'users': UserGroupIcon,
  'user': UserCircleIcon,

  // Data related
  'table': TableIcon,
  'list': ListIcon,
  'database': BoxCubeIcon,
}

export function getIcon(iconName: string | null): any {
  if (!iconName) return GridIcon  // default icon
  return iconMap[iconName.toLowerCase()] ?? GridIcon
}