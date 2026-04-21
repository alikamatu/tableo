'use client';

import * as React from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import { setCurrentBranch } from '@/stores/branchSlice';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

export function BranchSwitcher() {
  const dispatch = useAppDispatch();
  const { branches, current: currentBranch } = useAppSelector((s) => s.branch);

  if (branches.length === 0) return null;

  return (
    <Select
      value={currentBranch?.id}
      onValueChange={(id) => {
        const branch = branches.find((b) => b.id === id);
        if (branch) dispatch(setCurrentBranch(branch));
      }}
    >
      <SelectTrigger className="h-8 bg-background border-border hover:bg-accent transition-colors">
        <div className="flex items-center gap-2 truncate">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-sm" />
          <SelectValue placeholder="Select Branch" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
