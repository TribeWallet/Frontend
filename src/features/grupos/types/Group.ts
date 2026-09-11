import type { PillTone } from '../../../components/Pill';

export type GroupTone = 'blue' | 'green' | 'family';

export type GroupTagTone = PillTone | 'blue' | 'green';

export interface GroupMember {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

export interface GroupTag {
  label: string;
  tone: GroupTagTone;
}

export interface GroupSummary {
  members: number;
  openValue: string;
  paidValue: string;
}

export interface Group {
  id: string;
  tone: GroupTone;
  name: string;
  description: string;
  tags: GroupTag[];
  summary: GroupSummary;
  members: GroupMember[];
  extraMembers?: number;
  createdAt: string;
}
