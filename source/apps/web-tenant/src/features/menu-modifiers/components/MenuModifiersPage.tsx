'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import {
  Plus,
  Edit,
  Trash2,
  Layers3,
  Search,
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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-2">Modifier Groups</h2>
          <p className="text-sm text-gray-600">
            Define reusable groups for sizes, toppings, and options
          </p>
        </div>
        <MenuTabs />
      </div>

      {/* Search and action bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <Input
            placeholder="Search groups..."
            className="pl-9 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateGroup}>
          <Plus className="w-4 h-4" />
          New Group
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 240px)' }}>
        {/* Left: groups list */}
        <div className="col-span-3">
          <Card className="p-4 flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Groups</h3>
              <span className="text-xs text-gray-500">
                {filteredGroups.length}
              </span>
            </div>

            <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
              {filteredGroups.map((group) => {
                const isActive = group.id === selectedGroup?.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleSelectGroup(group.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {group.name}
                        </span>
                        {!group.active && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 shrink-0">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {group.options.length} opts · {group.attachedItemsCount} items
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ml-2 ${
                      isActive ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {group.type === 'single' ? '1' : 'N'}
                    </span>
                  </button>
                );
              })}

              {filteredGroups.length === 0 && (
                <div className="py-6 text-center text-sm text-gray-500">
                  No groups match &ldquo;{searchTerm}&rdquo;.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: selected group details */}
        <div className="col-span-9">
          <Card className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 240px)' }}>
            {selectedGroup ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedGroup.name}
                    </h3>
                    {selectedGroup.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {selectedGroup.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                        {selectedGroup.type === 'single' ? 'Choose 1' : 'Multi-select'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        selectedGroup.required
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {selectedGroup.required ? 'Required' : 'Optional'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-[11px] font-medium">
                        {selectedGroup.attachedItemsCount} items
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleEditGroup}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteGroup}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Options list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Options ({selectedGroup.options.length})
                    </h4>
                    <Button
                      variant="secondary"
                      onClick={handleAddOption}
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>

                  <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {selectedGroup.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 cursor-move">
                            ⋮⋮
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {option.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-emerald-600">
                            {option.priceDelta}
                          </span>
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-emerald-50 rounded-full transition-colors"
                            onClick={() =>
                              console.log('TODO: edit option', option.id)
                            }
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-50 rounded-full transition-colors"
                            onClick={() =>
                              console.log('TODO: delete option', option.id)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {selectedGroup.options.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 bg-white">
                        No options yet. Click <span className="font-semibold">Add</span> to create one.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Layers3 className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold mb-2">No group selected</h3>
                  <p className="text-sm text-gray-600">
                    Select a group from the list to view details
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
