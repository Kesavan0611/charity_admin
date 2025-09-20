import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'Project', title: 'Camp', href: paths.forms.AddProject, icon: 'user' },
  { key: 'adduser', title: 'User List', href: paths.forms.adduser, icon: 'user' },
  { key: 'Request', title: 'Request List', href: paths.forms.AddRequest, icon: 'file-text' },
   {
    key: 'Reports',
    title: 'User History',
    icon: 'file-text',
    href: paths.reports.userHistory,
  },
  {
    key: 'Transactions',
    title: 'Transactions History',
    icon: 'file-text',
    href: paths.reports.transactionsHistory,

  },
] satisfies NavItemConfig[];
