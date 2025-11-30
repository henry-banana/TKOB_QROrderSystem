'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Input } from '@/shared/components/ui/Input';
import {
  Plus,
  Edit,
  Trash2,
  Layers3,
  Search,
  ChevronRight,
} from 'lucide-react';
import { MenuTabs } from '@/features/menu-management/components/MenuTabs';

type ModifierOption = {
  id: string;
  name: string;
  priceDelta: string; // e.g. "+$3.00" or "+$0.00"
};

type ModifierGroup = {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  description?: string;
  required: boolean;
  options: ModifierOption[];
  attachedItemsCount: number;
  active: boolean;
};

const initialModifierGroups: ModifierGroup[] = [
  {
    id: 'size-default',
    name: 'Size Options',
    type: 'single',
    description: 'Small, Medium, Large sizes for most dishes',
    required: true,
    options: [
      { id: 'size-s', name: 'Small', priceDelta: '+$0.00' },
      { id: 'size-m', name: 'Medium', priceDelta: '+$3.00' },
      { id: 'size-l', name: 'Large', priceDelta: '+$5.00' },
    ],
    attachedItemsCount: 8,
    active: true,
  },
  {
    id: 'pizza-toppings',
    name: 'Pizza Toppings',
    type: 'multiple',
    description: 'Extra toppings for pizzas and flatbreads',
    required: false,
    options: [
      { id: 'top-cheese', name: 'Extra Cheese', priceDelta: '+$2.00' },
      { id: 'top-bacon', name: 'Bacon', priceDelta: '+$3.50' },
      { id: 'top-mushroom', name: 'Mushrooms', priceDelta: '+$1.50' },
    ],
    attachedItemsCount: 5,
    active: true,
  },
  {
    id: 'sauce-choice',
    name: 'Sauce Choice',
    type: 'single',
    description: 'Pick one sauce to serve with the dish',
    required: false,
    options: [
      { id: 'sauce-bbq', name: 'BBQ Sauce', priceDelta: '+$0.00' },
      { id: 'sauce-garlic', name: 'Garlic Aioli', priceDelta: '+$0.50' },
      { id: 'sauce-spicy', name: 'Spicy Mayo', priceDelta: '+$0.50' },
    ],
    attachedItemsCount: 3,
    active: true,
  },
];

export function MenuModifiersPage() {
  const [groups] = useState<ModifierGroup[]>(initialModifierGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialModifierGroups[0]?.id ?? ''
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [groups, searchTerm]
  );

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? filteredGroups[0],
    [groups, selectedGroupId, filteredGroups]
  );

  const handleSelectGroup = (id: string) => {
    setSelectedGroupId(id);
  };

  // Hiện tại chỉ mock – sau này bạn có thể gắn vào modal / API
  const handleCreateGroup = () => {
    console.log('TODO: open create-modifier-group modal');
  };

  const handleAddOption = () => {
    console.log('TODO: open add-option modal for', selectedGroup?.id);
  };

  const handleEditGroup = () => {
    console.log('TODO: open edit group modal for', selectedGroup?.id);
  };

  const handleDeleteGroup = () => {
    console.log('TODO: confirm delete group', selectedGroup?.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifiers</h1>
              <p className="mt-2 text-sm text-gray-600 max-w-xl">
                Define reusable size, topping, and extra option groups that you can
                attach to multiple menu items.
              </p>
            </div>
            <MenuTabs />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 -mr-6 z-10" />
            <Input
              placeholder="Search modifier groups..."
              className="pl-8 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={handleCreateGroup}>
            <Plus className="w-4 h-4 mr-2" />
            New Modifier Group
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        {/* Left: groups list */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
                Modifier Groups
              </h2>
            </div>
            <span className="text-xs text-gray-400">
              {filteredGroups.length} groups
            </span>
          </div>

          <div className="space-y-2">
            {filteredGroups.map((group) => {
              const isActive = group.id === selectedGroup?.id;

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleSelectGroup(group.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg border transition-all duration-150 flex items-center justify-between gap-3 ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {group.name}
                      </p>
                      {!group.active && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    {group.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-gray-500">
                      {group.options.length} options · used on{' '}
                      {group.attachedItemsCount} items
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        group.type === 'single' ? 'info' : 'success'
                      }
                      className="text-[11px]"
                    >
                      {group.type === 'single' ? 'Choose 1' : 'Choose many'}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500">
                No modifier groups match “{searchTerm}”.
              </div>
            )}
          </div>
        </Card>

        {/* Right: selected group details */}
        <Card className="p-6">
          {selectedGroup ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedGroup.name}
                  </h2>
                  {selectedGroup.description && (
                    <p className="mt-2 text-sm text-gray-600 max-w-xl">
                      {selectedGroup.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      variant={
                        selectedGroup.type === 'single' ? 'info' : 'success'
                      }
                    >
                      {selectedGroup.type === 'single'
                        ? 'Customer chooses 1 option'
                        : 'Customer can choose multiple options'}
                    </Badge>
                    <Badge
                      variant={selectedGroup.required ? 'warning' : 'neutral'}
                    >
                      {selectedGroup.required ? 'Required' : 'Optional'}
                    </Badge>
                    <Badge variant="neutral">
                      Used on {selectedGroup.attachedItemsCount} items
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    onClick={handleEditGroup}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Group
                  </Button>
                  <Button
                    variant="tertiary"
                    className="px-3 py-2 text-red-600 hover:bg-red-50"
                    onClick={handleDeleteGroup}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Options list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Options
                  </h3>
                  <Button
                    variant="tertiary"
                    className="px-3 py-1 text-sm"
                    onClick={handleAddOption}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 bg-gray-50/60">
                  {selectedGroup.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between px-4 py-3 bg-white/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400 cursor-move">
                          ⋮⋮
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {option.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-800">
                          {option.priceDelta}
                        </span>
                        <Button
                          variant="tertiary"
                          className="px-2 py-1"
                          onClick={() =>
                            console.log('TODO: edit option', option.id)
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="tertiary"
                          className="px-2 py-1 text-red-600 hover:bg-red-50"
                          onClick={() =>
                            console.log('TODO: delete option', option.id)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {selectedGroup.options.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500 bg-white/80">
                      This group has no options yet. Click{' '}
                      <span className="font-semibold">Add Option</span> to
                      create your first one.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <Layers3 className="w-10 h-10 text-emerald-400 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">
                No modifier group selected
              </h2>
              <p className="mt-2 text-sm text-gray-600 max-w-sm">
                Create a new group on the left or select an existing one to see
                its options and settings.
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={handleCreateGroup}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Modifier Group
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
