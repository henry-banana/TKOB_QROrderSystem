/**
 * Menu Mock Adapter
 * Mock data for development/testing
 */

import type {
  MenuCategoryResponseDto,
  MenuItemResponseDto,
  ModifierGroupResponseDto,
} from '@/services/generated/models';
import { mockCategories, mockMenuItems, mockModifierGroups } from '@/services/mocks/menu-data';

/**
 * Menu Categories Mock
 */
export const menuCategoriesMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories;
  },
  async findOne(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const category = mockCategories.find(c => c.id === id);
    if (!category) throw new Error(`Category ${id} not found`);
    return category;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const maxDisplayOrder = mockCategories.reduce((max, cat) => Math.max(max, cat.displayOrder || 0), -1);
    const newCategory = { 
      id: Date.now().toString(), 
      displayOrder: maxDisplayOrder + 1,
      active: true,
      itemCount: 0,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories[index] = { 
        ...mockCategories[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockCategories[index];
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }
    return { success: true };
  },
};

/**
 * Menu Items Mock
 */
export const menuItemsMock = {
  async findAll(params?: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get all items with mapped fields
    const allItems = mockMenuItems.map(item => {
      // Populate modifierGroups from modifierGroupIds
      const modifierGroups = item.modifierGroupIds
        ? mockModifierGroups.filter(mg => item.modifierGroupIds?.includes(mg.id))
        : [];
      
      return {
        ...item,
        isAvailable: item.available,
        dietary: item.tags, // Map tags → dietary for UI
        modifierGroups, // Add populated modifier groups
      };
    });

    console.log('[Mock Adapter] Total items from mockMenuItems:', mockMenuItems.length);
    console.log('[Mock Adapter] Returning items count:', allItems.length);

    // For mock data, return all items without pagination
    // Client-side will handle filtering and pagination
    return allItems;
  },
  async findOne(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === id);
    if (!item) throw new Error(`Item ${id} not found`);
    
    const modifierGroups = item.modifierGroupIds
      ? mockModifierGroups.filter(mg => item.modifierGroupIds?.includes(mg.id))
      : [];
    
    return {
      ...item,
      isAvailable: item.available,
      dietary: item.tags,
      modifierGroups,
    };
  },
  async toggleAvailability(id: string, data: { isAvailable: boolean }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === id);
    if (!item) throw new Error(`Item ${id} not found`);
    
    item.available = data.isAvailable;
    
    const modifierGroups = item.modifierGroupIds
      ? mockModifierGroups.filter(mg => item.modifierGroupIds?.includes(mg.id))
      : [];
    
    return {
      ...item,
      isAvailable: item.available,
      dietary: item.tags,
      modifierGroups,
    };
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newItem = {
      id: Date.now().toString(), 
      ...data,
      available: data.available ?? true, // Ensure available field exists
      tags: data.tags || data.dietary || [], // Map dietary → tags
      allergens: data.allergens || [],
      preparationTime: data.preparationTime || 0,
      displayOrder: data.displayOrder ?? 0, // Ensure displayOrder field exists
      status: data.status || 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockMenuItems.push(newItem);
    
    // Populate modifierGroups for return
    const modifierGroups = newItem.modifierGroupIds
      ? mockModifierGroups.filter(mg => newItem.modifierGroupIds?.includes(mg.id))
      : [];
    
    return {
      ...newItem,
      isAvailable: newItem.available,
      dietary: newItem.tags,
      modifierGroups,
    };
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      // Map fields from UI to mock data format
      const updateData = {
        ...data,
        available: data.available ?? mockMenuItems[index].available,
        tags: data.tags || data.dietary || mockMenuItems[index].tags,
        allergens: data.allergens ?? mockMenuItems[index].allergens,
        preparationTime: data.preparationTime ?? mockMenuItems[index].preparationTime,
        displayOrder: data.displayOrder ?? mockMenuItems[index].displayOrder,
        status: data.status ?? mockMenuItems[index].status,
        modifierGroupIds: data.modifierGroupIds ?? mockMenuItems[index].modifierGroupIds,
      };
      
      mockMenuItems[index] = { 
        ...mockMenuItems[index], 
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      // Populate modifierGroups for return
      const modifierGroups = mockMenuItems[index].modifierGroupIds
        ? mockModifierGroups.filter(mg => mockMenuItems[index].modifierGroupIds?.includes(mg.id))
        : [];
      
      // Return with UI field mapping
      return {
        ...mockMenuItems[index],
        isAvailable: mockMenuItems[index].available,
        dietary: mockMenuItems[index].tags,
        modifierGroups,
      };
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      mockMenuItems.splice(index, 1);
    }
    return { success: true };
  },
};

/**
 * Modifiers Mock
 */
export const modifiersMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('🎭 [ModifiersMock] Returning mock modifier groups:', mockModifierGroups.length);
    return mockModifierGroups;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newModifier = {
      id: `mod-${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      required: data.required,
      minChoices: data.minChoices || 0,
      maxChoices: data.maxChoices || 0,
      displayOrder: data.displayOrder || mockModifierGroups.length + 1,
      active: true, // ✅ Always active on create
      options: data.options.map((opt: any, idx: number) => {
        // If ID starts with 'temp-', generate new ID; otherwise keep existing
        const optId = opt.id?.startsWith('temp-') 
          ? `opt-${Date.now()}-${idx}` 
          : opt.id;
        return {
          id: optId,
          name: opt.name,
          priceDelta: opt.priceDelta,
          displayOrder: opt.displayOrder,
          active: true, // ✅ Always active on create
        };
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockModifierGroups.push(newModifier);
    console.log('🎭 [ModifiersMock] Created:', newModifier);
    return newModifier;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockModifierGroups.findIndex(m => m.id === id);
    if (index !== -1) {
      // Process options: keep existing if no temp-* ID, generate new for temp-*
      const updatedOptions = data.options?.map((opt: any, idx: number) => {
        const optId = opt.id?.startsWith('temp-') 
          ? `opt-${Date.now()}-${idx}` 
          : opt.id;
        return {
          id: optId,
          name: opt.name,
          priceDelta: opt.priceDelta,
          displayOrder: opt.displayOrder,
          active: opt.active !== false, // Preserve or default to true
        };
      }) || mockModifierGroups[index].options;
      
      mockModifierGroups[index] = {
        ...mockModifierGroups[index],
        ...data,
        options: updatedOptions,
        updatedAt: new Date().toISOString(),
      };
      console.log('🎭 [ModifiersMock] Updated:', mockModifierGroups[index]);
      return mockModifierGroups[index];
    }
    return null;
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockModifierGroups.findIndex(m => m.id === id);
    if (index !== -1) {
      mockModifierGroups.splice(index, 1);
    }
    return { success: true };
  },
};

/**
 * Menu Photos Mock
 */
export const menuPhotosMock = {
  async upload(itemId: string, data: { file: File }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: `photo-${Date.now()}`,
      url: URL.createObjectURL(data.file),
      filename: data.file.name,
      isPrimary: false,
      displayOrder: 0,
      size: data.file.size,
      mimeType: data.file.type,
      createdAt: new Date().toISOString(),
    };
  },
  async getPhotos(itemId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === itemId);
    return item?.photos || [];
  },
  async delete(itemId: string, photoId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === itemId);
    if (item?.photos) {
      item.photos = item.photos.filter(p => p.id !== photoId);
    }
    return { success: true };
  },
  async setPrimary(itemId: string, photoId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === itemId);
    if (!item?.photos) throw new Error(`Item ${itemId} not found`);
    item.photos.forEach(p => p.isPrimary = p.id === photoId);
    return { success: true };
  },
  async bulkUpload(itemId: string, data: { files: File[] }) {
    await new Promise(resolve => setTimeout(resolve, 500 * data.files.length));
    return data.files.map((file, i) => ({
      id: `photo-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      filename: file.name,
      isPrimary: i === 0,
      displayOrder: i,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
    }));
  },
  async updateOrder(itemId: string, photoId: string, data: { displayOrder: number }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === itemId);
    if (!item?.photos) throw new Error(`Item ${itemId} not found`);
    const photo = item.photos.find(p => p.id === photoId);
    if (photo) photo.displayOrder = data.displayOrder;
    return { success: true };
  },
};

// Unified mock
export const menuMock = {
  categories: menuCategoriesMock,
  items: menuItemsMock,
  modifiers: modifiersMock,
  photos: menuPhotosMock,
};
